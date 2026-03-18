use uuid::Uuid;

use crate::errors::AppError;
use crate::handlers::resources::CreateResourceRequest;
use crate::models::resource::Resource;
use crate::repositories;
use crate::state::AppState;

/// Create a new resource.
pub async fn create(
    state: &AppState,
    author_id: Uuid,
    req: CreateResourceRequest,
) -> Result<Resource, AppError> {
    if req.title.trim().is_empty() {
        return Err(AppError::BadRequest("Title cannot be empty".into()));
    }

    let resource = repositories::resources::create(
        &state.db,
        author_id,
        req.category_id,
        &req.resource_type,
        &req.title,
        req.description.as_deref(),
        &req.tags.unwrap_or_default(),
        req.r2_key.as_deref(),
        req.file_url.as_deref(),
        req.file_size,
        req.youtube_url.as_deref(),
        req.thumbnail_url.as_deref(),
        req.content.as_deref(),
    )
    .await?;

    Ok(resource)
}

/// List resources with optional search, filtering, and pagination.
pub async fn list(
    state: &AppState,
    search: Option<String>,
    resource_type: Option<String>,
    category_id: Option<Uuid>,
    tag: Option<String>,
    page: i64,
    page_size: i64,
) -> Result<Vec<Resource>, AppError> {
    let page_size = page_size.min(50).max(1);
    let page = page.max(1);
    let offset = (page - 1) * page_size;

    let resources = repositories::resources::list(
        &state.db,
        search.as_deref(),
        resource_type.as_deref(),
        category_id,
        tag.as_deref(),
        page_size,
        offset,
    )
    .await?;

    Ok(resources)
}

/// Get a single resource by ID.
pub async fn get_one(state: &AppState, id: Uuid) -> Result<Resource, AppError> {
    repositories::resources::find_by_id(&state.db, id)
        .await?
        .ok_or(AppError::NotFound)
}

/// Delete a resource. Only the author may delete their own resource.
pub async fn delete(
    state: &AppState,
    student_id: Uuid,
    resource_id: Uuid,
) -> Result<(), AppError> {
    let resource = repositories::resources::find_by_id(&state.db, resource_id)
        .await?
        .ok_or(AppError::NotFound)?;

    if resource.author_id != student_id {
        return Err(AppError::Forbidden);
    }

    if let Some(key) = &resource.r2_key {
        repositories::storage::delete_object(&state.r2, &state.r2_bucket, key)
            .await
            .map_err(|e| AppError::Storage(e.to_string()))?;
    }

    repositories::resources::delete(&state.db, resource_id).await?;
    Ok(())
}
