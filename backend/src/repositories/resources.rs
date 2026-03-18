use sqlx::PgPool;
use uuid::Uuid;

use crate::models::resource::Resource;

/// Find a single resource by ID (with author and category names joined).
pub async fn find_by_id(db: &PgPool, id: Uuid) -> Result<Option<Resource>, sqlx::Error> {
    sqlx::query_as!(
        Resource,
        r#"
        SELECT
          r.id, r.author_id, s.full_name AS author_name,
          r.category_id, c.name AS category_name,
          r.type AS resource_type, r.title, r.description, r.tags,
          r.file_url, r.file_size, r.r2_key,
          r.youtube_url, r.thumbnail_url,
          r.content, r.created_at
        FROM resources r
        JOIN students  s ON s.id = r.author_id
        JOIN categories c ON c.id = r.category_id
        WHERE r.id = $1
        "#,
        id,
    )
    .fetch_optional(db)
    .await
}

/// List resources with full-text search, type/category/tag filtering, and pagination.
pub async fn list(
    db: &PgPool,
    search: Option<&str>,
    resource_type: Option<&str>,
    category_id: Option<Uuid>,
    tag: Option<&str>,
    limit: i64,
    offset: i64,
) -> Result<Vec<Resource>, sqlx::Error> {
    sqlx::query_as!(
        Resource,
        r#"
        SELECT
          r.id, r.author_id, s.full_name AS author_name,
          r.category_id, c.name AS category_name,
          r.type AS resource_type, r.title, r.description, r.tags,
          r.file_url, r.file_size, r.r2_key,
          r.youtube_url, r.thumbnail_url,
          r.content, r.created_at
        FROM resources r
        JOIN students  s ON s.id = r.author_id
        JOIN categories c ON c.id = r.category_id
        WHERE
          ($1::TEXT IS NULL OR r.search_vector @@ plainto_tsquery('english', $1))
          AND ($2::TEXT IS NULL OR r.type = $2)
          AND ($3::UUID IS NULL OR r.category_id = $3)
          AND ($4::TEXT IS NULL OR $4 = ANY(r.tags))
        ORDER BY
          CASE WHEN $1 IS NOT NULL
            THEN ts_rank(r.search_vector, plainto_tsquery('english', $1))
            ELSE 0
          END DESC,
          r.created_at DESC
        LIMIT $5 OFFSET $6
        "#,
        search,
        resource_type,
        category_id,
        tag,
        limit,
        offset,
    )
    .fetch_all(db)
    .await
}

/// Insert a new resource row.
pub async fn create(
    db: &PgPool,
    author_id: Uuid,
    category_id: Uuid,
    resource_type: &str,
    title: &str,
    description: Option<&str>,
    tags: &[String],
    r2_key: Option<&str>,
    file_url: Option<&str>,
    file_size: Option<i64>,
    youtube_url: Option<&str>,
    thumbnail_url: Option<&str>,
    content: Option<&str>,
) -> Result<Resource, sqlx::Error> {
    sqlx::query_as!(
        Resource,
        r#"
        WITH ins AS (
          INSERT INTO resources (
            author_id, category_id, type, title, description, tags,
            r2_key, file_url, file_size,
            youtube_url, thumbnail_url, content
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *
        )
        SELECT
          ins.id, ins.author_id, s.full_name AS author_name,
          ins.category_id, c.name AS category_name,
          ins.type AS resource_type, ins.title, ins.description, ins.tags,
          ins.file_url, ins.file_size, ins.r2_key,
          ins.youtube_url, ins.thumbnail_url,
          ins.content, ins.created_at
        FROM ins
        JOIN students  s ON s.id = ins.author_id
        JOIN categories c ON c.id = ins.category_id
        "#,
        author_id,
        category_id,
        resource_type,
        title,
        description,
        tags,
        r2_key,
        file_url,
        file_size,
        youtube_url,
        thumbnail_url,
        content,
    )
    .fetch_one(db)
    .await
}

/// Delete a resource by ID.
pub async fn delete(db: &PgPool, id: Uuid) -> Result<(), sqlx::Error> {
    sqlx::query!("DELETE FROM resources WHERE id = $1", id)
        .execute(db)
        .await?;
    Ok(())
}
