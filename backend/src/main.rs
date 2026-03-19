mod errors;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod router;
mod services;
mod state;

use state::AppState;

use aws_sdk_s3::config::Credentials;

#[tokio::main]
async fn main() {
    rustls::crypto::ring::default_provider()
        .install_default()
        .expect("Failed to install rustls crypto provider");
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "if_knowledge_repo_api=debug,tower_http=debug".into()),
        )
        .init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    let access_key = std::env::var("R2_ACCESS_KEY_ID").expect("R2_ACCESS_KEY_ID must be set");
    let secret_key =
        std::env::var("R2_SECRET_ACCESS_KEY").expect("R2_SECRET_ACCESS_KEY must be set");
    let r2_endpoint = std::env::var("R2_ENDPOINT").expect("R2_ENDPOINT must be set");
    let r2_bucket = std::env::var("R2_BUCKET").expect("R2_BUCKET must be set");
    let r2_public_url = std::env::var("R2_PUBLIC_URL").expect("R2_PUBLIC_URL must be set");
    let frontend_url = std::env::var("FRONTEND_URL").expect("FRONTEND_URL must be set");

    let db = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to database");

    sqlx::migrate!("./migrations")
        .run(&db)
        .await
        .expect("Failed to run database migrations");

    let credentials = Credentials::new(&access_key, &secret_key, None, None, "custom");

    let r2_config = aws_config::from_env()
        .endpoint_url(&r2_endpoint)
        .region(aws_config::Region::new("auto"))
        .credentials_provider(credentials)
        .load()
        .await;

    let r2 = aws_sdk_s3::Client::from_conf(
        aws_sdk_s3::config::Builder::from(&r2_config)
            .force_path_style(true)
            .build(),
    );

    let state = AppState {
        db,
        r2,
        r2_bucket,
        r2_public_url,
        jwt_secret,
        frontend_url,
    };

    let app = router::build(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("Failed to bind to port 8080");

    tracing::info!("Server listening on 0.0.0.0:8080");

    axum::serve(listener, app).await.expect("Server failed");
}
