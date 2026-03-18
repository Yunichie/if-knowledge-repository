use sqlx::PgPool;

use crate::models::category::Category;

/// List all categories.
pub async fn list_all(db: &PgPool) -> Result<Vec<Category>, sqlx::Error> {
    sqlx::query_as!(Category, "SELECT id, name, slug FROM categories ORDER BY name")
        .fetch_all(db)
        .await
}
