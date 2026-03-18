use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

/// A registered student in the system.
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Student {
    pub id: Uuid,
    pub email: String,
    pub full_name: String,
    pub avatar_url: Option<String>,
    pub created_at: DateTime<Utc>,
}
