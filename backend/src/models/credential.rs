use uuid::Uuid;

/// An authentication credential linked to a student.
/// Each student may have one "email" credential and/or one "google" credential.
#[derive(Debug, sqlx::FromRow)]
pub struct AuthCredential {
    pub id: Uuid,
    pub student_id: Uuid,
    pub provider: String,
    pub provider_id: Option<String>,
    pub password_hash: Option<String>,
}
