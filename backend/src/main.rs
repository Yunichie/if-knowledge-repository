mod errors;
mod handlers;
mod middleware;
mod models;
mod repositories;
mod router;
mod services;
mod state;

use state::AppState;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "if_knowledge_repo_api=debug,tower_http=debug".into()),
        )
        .init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let jwt_secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
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

    let r2_config = aws_config::from_env().load().await;
    let r2 = aws_sdk_s3::Client::new(&r2_config);

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
