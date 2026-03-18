use sqlx::PgPool;
use uuid::Uuid;

use crate::models::student::Student;

/// Find a student by their email address.
pub async fn find_by_email(db: &PgPool, email: &str) -> Result<Option<Student>, sqlx::Error> {
    sqlx::query_as!(
        Student,
        "SELECT id, email, full_name, avatar_url, created_at FROM students WHERE email = $1",
        email
    )
    .fetch_optional(db)
    .await
}

/// Find a student by their ID.
pub async fn find_by_id(db: &PgPool, id: Uuid) -> Result<Option<Student>, sqlx::Error> {
    sqlx::query_as!(
        Student,
        "SELECT id, email, full_name, avatar_url, created_at FROM students WHERE id = $1",
        id
    )
    .fetch_optional(db)
    .await
}

/// Create a new student with an email/password credential atomically.
pub async fn create_with_credential(
    db: &PgPool,
    email: &str,
    full_name: &str,
    password_hash: &str,
) -> Result<Student, sqlx::Error> {
    let mut tx = db.begin().await?;

    let student = sqlx::query_as!(
        Student,
        r#"
        INSERT INTO students (email, full_name)
        VALUES ($1, $2)
        RETURNING id, email, full_name, avatar_url, created_at
        "#,
        email,
        full_name,
    )
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query!(
        r#"
        INSERT INTO auth_credentials (student_id, provider, password_hash)
        VALUES ($1, 'email', $2)
        "#,
        student.id,
        password_hash,
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(student)
}

/// Upsert a student from Google OAuth. Creates or updates the student
/// record and ensures a google credential row exists.
pub async fn upsert_google(
    db: &PgPool,
    email: &str,
    full_name: &str,
    avatar_url: Option<&str>,
    google_sub: &str,
) -> Result<Student, sqlx::Error> {
    let mut tx = db.begin().await?;

    let student = sqlx::query_as!(
        Student,
        r#"
        INSERT INTO students (email, full_name, avatar_url)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE
          SET full_name = EXCLUDED.full_name,
              avatar_url = COALESCE(EXCLUDED.avatar_url, students.avatar_url)
        RETURNING id, email, full_name, avatar_url, created_at
        "#,
        email,
        full_name,
        avatar_url,
    )
    .fetch_one(&mut *tx)
    .await?;

    sqlx::query!(
        r#"
        INSERT INTO auth_credentials (student_id, provider, provider_id)
        VALUES ($1, 'google', $2)
        ON CONFLICT (student_id, provider) DO UPDATE
          SET provider_id = EXCLUDED.provider_id
        "#,
        student.id,
        google_sub,
    )
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;
    Ok(student)
}
