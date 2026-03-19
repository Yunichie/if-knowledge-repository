use axum::extract::State;
use axum::http::StatusCode;
use axum::Json;
use serde::Deserialize;

use crate::errors::AppError;
use crate::services;
use crate::services::auth::AuthResponse;
use crate::state::AppState;

/// Request body for registration.
#[derive(Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub full_name: String,
    pub password: String,
}

/// Request body for login.
#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

/// Request body for Google OAuth login.
#[derive(Deserialize)]
pub struct GoogleAuthRequest {
    pub access_token: String,
}

/// POST /api/v1/auth/register
pub async fn register(
    State(state): State<AppState>,
    Json(body): Json<RegisterRequest>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    let response = services::auth::register(&state, body).await?;
    Ok((StatusCode::CREATED, Json(response)))
}

/// POST /api/v1/auth/login
pub async fn login(
    State(state): State<AppState>,
    Json(body): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let response = services::auth::login(&state, body).await?;
    Ok(Json(response))
}

/// POST /api/v1/auth/google
pub async fn google(
    State(state): State<AppState>,
    Json(body): Json<GoogleAuthRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let response = services::auth::google_login(&state, &body.access_token).await?;
    Ok(Json(response))
}
