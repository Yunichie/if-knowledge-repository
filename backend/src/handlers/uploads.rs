use axum::extract::{Extension, State};
use axum::response::IntoResponse;
use axum::Json;

use crate::errors::AppError;
use crate::middleware::auth::AuthenticatedUser;
use crate::services;
use crate::state::AppState;

/// POST /api/v1/uploads/presign
pub async fn presign(
    State(state): State<AppState>,
    Extension(_user): Extension<AuthenticatedUser>,
    Json(body): Json<services::uploads::PresignRequest>,
) -> Result<impl IntoResponse, AppError> {
    let response = services::uploads::presign(&state, body).await?;
    Ok(Json(response))
}
