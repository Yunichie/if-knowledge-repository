use uuid::Uuid;

use crate::errors::AppError;
use crate::repositories;
use crate::state::AppState;

/// Maximum allowed file size: 50 MB.
const MAX_FILE_SIZE: i64 = 52_428_800;

/// Presigned URL expiry: 5 minutes.
const PRESIGN_EXPIRY_SECS: u64 = 300;

/// Request payload for presigning.
#[derive(serde::Deserialize)]
pub struct PresignRequest {
    pub filename: String,
    pub content_type: String,
    pub file_size: i64,
}

/// Response payload from presigning.
#[derive(serde::Serialize)]
pub struct PresignResponse {
    pub upload_url: String,
    pub file_url: String,
    pub key: String,
}

/// Validate the upload request and generate a presigned PUT URL.
pub async fn presign(state: &AppState, req: PresignRequest) -> Result<PresignResponse, AppError> {
    if req.content_type != "application/pdf" {
        return Err(AppError::BadRequest(
            "Only PDF files are allowed".into(),
        ));
    }

    if req.file_size > MAX_FILE_SIZE {
        return Err(AppError::BadRequest(
            "File size exceeds 50 MB limit".into(),
        ));
    }

    if req.file_size <= 0 {
        return Err(AppError::BadRequest("Invalid file size".into()));
    }

    let sanitized = req
        .filename
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '.' || *c == '-' || *c == '_')
        .collect::<String>();

    let file_id = Uuid::new_v4();
    let key = format!("pdfs/{}/{}", file_id, sanitized);

    let upload_url = repositories::storage::presign_put(
        &state.r2,
        &state.r2_bucket,
        &key,
        &req.content_type,
        PRESIGN_EXPIRY_SECS,
    )
    .await
    .map_err(|e| AppError::Storage(e.to_string()))?;

    let file_url = format!("{}/{}", state.r2_public_url, key);

    Ok(PresignResponse {
        upload_url,
        file_url,
        key,
    })
}
