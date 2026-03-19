use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};

use crate::errors::AppError;
use crate::handlers::auth::{LoginRequest, RegisterRequest};
use crate::models::student::Student;
use crate::repositories;
use crate::state::AppState;

/// JWT claims payload.
#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub email: String,
    pub name: String,
    pub exp: usize,
}

/// Response returned after successful authentication.
#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub student: StudentDto,
}

/// Student data returned to the client (no internal fields).
#[derive(Serialize)]
pub struct StudentDto {
    pub id: String,
    pub email: String,
    pub full_name: String,
    pub avatar_url: Option<String>,
}

impl From<Student> for StudentDto {
    fn from(s: Student) -> Self {
        Self {
            id: s.id.to_string(),
            email: s.email,
            full_name: s.full_name,
            avatar_url: s.avatar_url,
        }
    }
}

/// Google userinfo API response.
#[derive(Deserialize)]
struct GoogleUserInfo {
    sub: String,
    email: String,
    name: String,
    picture: Option<String>,
}

/// Hash a plaintext password with Argon2id.
pub fn hash_password(password: &str) -> Result<String, AppError> {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Password hashing failed")))
}

/// Verify a plaintext password against a stored Argon2id hash.
pub fn verify_password(password: &str, hash: &str) -> Result<bool, AppError> {
    let parsed = PasswordHash::new(hash)
        .map_err(|_| AppError::Internal(anyhow::anyhow!("Invalid password hash")))?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok())
}

/// Issue a signed JWT for a student. Expires in 7 days.
pub fn issue_jwt(student: &Student, secret: &str) -> Result<String, AppError> {
    let claims = Claims {
        sub: student.id.to_string(),
        email: student.email.clone(),
        name: student.full_name.clone(),
        exp: (Utc::now() + Duration::days(7)).timestamp() as usize,
    };
    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|_| AppError::Internal(anyhow::anyhow!("JWT issuance failed")))
}

/// Register a new student with email and password.
pub async fn register(state: &AppState, req: RegisterRequest) -> Result<AuthResponse, AppError> {
    if req.password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".into(),
        ));
    }
    if req.full_name.trim().is_empty() {
        return Err(AppError::BadRequest("Name cannot be empty".into()));
    }

    if repositories::students::find_by_email(&state.db, &req.email)
        .await?
        .is_some()
    {
        return Err(AppError::BadRequest("Email already in use".into()));
    }

    let password_hash = hash_password(&req.password)?;

    let student = repositories::students::create_with_credential(
        &state.db,
        &req.email,
        &req.full_name,
        &password_hash,
    )
    .await?;

    let token = issue_jwt(&student, &state.jwt_secret)?;
    Ok(AuthResponse {
        token,
        student: student.into(),
    })
}

/// Log in with email and password.
pub async fn login(state: &AppState, req: LoginRequest) -> Result<AuthResponse, AppError> {
    let student = repositories::students::find_by_email(&state.db, &req.email)
        .await?
        .ok_or_else(|| AppError::BadRequest("Invalid email or password".into()))?;

    let credential = repositories::credentials::find_email_credential(&state.db, student.id)
        .await?
        .ok_or_else(|| AppError::BadRequest("Invalid email or password".into()))?;

    if !verify_password(
        &req.password,
        credential.password_hash.as_deref().unwrap_or(""),
    )? {
        return Err(AppError::BadRequest("Invalid email or password".into()));
    }

    let token = issue_jwt(&student, &state.jwt_secret)?;
    Ok(AuthResponse {
        token,
        student: student.into(),
    })
}

/// Log in or register via Google OAuth.
/// Fetches the user's profile from Google, upserts them in the DB, and issues a backend JWT.
pub async fn google_login(state: &AppState, access_token: &str) -> Result<AuthResponse, AppError> {
    let client = reqwest::Client::new();
    let google_user = client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("Failed to contact Google: {}", e)))?
        .json::<GoogleUserInfo>()
        .await
        .map_err(|e| {
            AppError::Internal(anyhow::anyhow!("Failed to parse Google response: {}", e))
        })?;

    let student = repositories::students::upsert_google(
        &state.db,
        &google_user.email,
        &google_user.name,
        google_user.picture.as_deref(),
        &google_user.sub,
    )
    .await?;

    let token = issue_jwt(&student, &state.jwt_secret)?;
    Ok(AuthResponse {
        token,
        student: student.into(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn password_hash_and_verify_roundtrip() {
        let hash = hash_password("correct-horse-battery").unwrap();
        assert!(verify_password("correct-horse-battery", &hash).unwrap());
        assert!(!verify_password("wrong-password", &hash).unwrap());
    }
}
