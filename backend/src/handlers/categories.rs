use axum::extract::State;
use axum::response::IntoResponse;
use axum::Json;

use crate::errors::AppError;
use crate::repositories;
use crate::state::AppState;

/// GET /api/v1/categories
pub async fn list(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    let categories = repositories::categories::list_all(&state.db).await?;
    Ok(Json(categories))
}
