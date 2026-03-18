use serde::Serialize;
use uuid::Uuid;

/// A resource category (e.g. Algorithms, Databases).
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Category {
    pub id: Uuid,
    pub name: String,
    pub slug: String,
}
