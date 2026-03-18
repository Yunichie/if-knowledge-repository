use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

/// A knowledge resource (PDF, YouTube link, or Markdown article).
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Resource {
    pub id: Uuid,
    pub author_id: Uuid,
    pub author_name: String,
    pub category_id: Uuid,
    pub category_name: String,
    #[sqlx(rename = "type")]
    #[serde(rename = "type")]
    pub resource_type: String,
    pub title: String,
    pub description: Option<String>,
    pub tags: Vec<String>,
    pub file_url: Option<String>,
    pub file_size: Option<i64>,
    pub r2_key: Option<String>,
    pub youtube_url: Option<String>,
    pub thumbnail_url: Option<String>,
    pub content: Option<String>,
    pub created_at: DateTime<Utc>,
}
