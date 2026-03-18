/// Application-wide shared state, constructed once at startup.
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub r2: aws_sdk_s3::Client,
    pub r2_bucket: String,
    pub r2_public_url: String,
    pub jwt_secret: String,
    pub frontend_url: String,
}
