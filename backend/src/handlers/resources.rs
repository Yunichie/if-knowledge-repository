use axum::extract::{Extension, Path, Query, State};
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::Json;
use serde::Deserialize;
use uuid::Uuid;

use crate::errors::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::services;
use crate::state::AppState;

/// Request body for creating a resource.
#[derive(Deserialize)]
pub struct CreateResourceRequest {
    pub category_id: Uuid,
    #[serde(rename = "type")]
    pub resource_type: String,
    pub title: String,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub file_url: Option<String>,
    pub file_size: Option<i64>,
    pub r2_key: Option<String>,
    pub youtube_url: Option<String>,
    pub thumbnail_url: Option<String>,
    pub content: Option<String>,
}

/// Query parameters for listing resources.
#[derive(Deserialize)]
pub struct ResourceQuery {
    pub q: Option<String>,
    #[serde(rename = "type")]
    pub resource_type: Option<String>,
    pub category_id: Option<Uuid>,
    pub tag: Option<String>,
    pub page: Option<i64>,
    pub page_size: Option<i64>,
}

/// GET /api/v1/resources
pub async fn list(
    State(state): State<AppState>,
    Query(query): Query<ResourceQuery>,
) -> Result<impl IntoResponse, AppError> {
    let resources = services::resources::list(
        &state,
        query.q,
        query.resource_type,
        query.category_id,
        query.tag,
        query.page.unwrap_or(1),
        query.page_size.unwrap_or(20),
    )
    .await?;

    Ok(Json(resources))
}

/// GET /api/v1/resources/:id
pub async fn get_one(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let resource = services::resources::get_one(&state, id).await?;
    Ok(Json(resource))
}

/// POST /api/v1/resources
pub async fn create(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Json(body): Json<CreateResourceRequest>,
) -> Result<impl IntoResponse, AppError> {
    let author_id: Uuid = user
        .claims
        .sub
        .parse()
        .map_err(|_| AppError::Unauthorized)?;

    let resource = services::resources::create(&state, author_id, body).await?;
    Ok((StatusCode::CREATED, Json(resource)))
}

/// DELETE /api/v1/resources/:id
pub async fn delete(
    State(state): State<AppState>,
    Extension(user): Extension<AuthenticatedUser>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let student_id: Uuid = user
        .claims
        .sub
        .parse()
        .map_err(|_| AppError::Unauthorized)?;

    services::resources::delete(&state, student_id, id).await?;
    Ok(StatusCode::NO_CONTENT)
}
