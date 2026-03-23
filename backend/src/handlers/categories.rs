use axum::extract::State;
use axum::http::header;
use axum::response::IntoResponse;
use axum::Json;

use crate::errors::AppError;
use crate::repositories;
use crate::state::AppState;

/// GET /api/v1/categories
///
/// Categories are effectively static (seeded at migration time and rarely changed)
pub async fn list(State(state): State<AppState>) -> Result<impl IntoResponse, AppError> {
    let categories = repositories::categories::list_all(&state.db).await?;
    Ok((
        [(
            header::CACHE_CONTROL,
            "public, max-age=3600, stale-while-revalidate=60",
        )],
        Json(categories),
    ))
}
