use sqlx::PgPool;
use uuid::Uuid;

use crate::models::credential::AuthCredential;

/// Find the email/password credential for a student.
pub async fn find_email_credential(
    db: &PgPool,
    student_id: Uuid,
) -> Result<Option<AuthCredential>, sqlx::Error> {
    sqlx::query_as!(
        AuthCredential,
        r#"
        SELECT id, student_id, provider, provider_id, password_hash
        FROM auth_credentials
        WHERE student_id = $1 AND provider = 'email'
        "#,
        student_id,
    )
    .fetch_optional(db)
    .await
}
