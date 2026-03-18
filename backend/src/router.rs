use axum::http::header::{AUTHORIZATION, CONTENT_TYPE};
use axum::http::{HeaderValue, Method};
use axum::routing::{delete, get, post};
use axum::Router;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

use crate::handlers;
use crate::middleware;
use crate::state::AppState;

/// Build the application router with all routes, middleware, and layers.
pub fn build(state: AppState) -> Router {
    let public_routes = Router::new()
        .route("/auth/register", post(handlers::auth::register))
        .route("/auth/login", post(handlers::auth::login))
        .route("/resources", get(handlers::resources::list))
        .route("/resources/:id", get(handlers::resources::get_one))
        .route("/categories", get(handlers::categories::list));

    let protected_routes = Router::new()
        .route("/resources", post(handlers::resources::create))
        .route("/resources/:id", delete(handlers::resources::delete))
        .route("/uploads/presign", post(handlers::uploads::presign))
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            middleware::auth::require_auth,
        ));

    let api = Router::new()
        .merge(public_routes)
        .merge(protected_routes);

    let cors = CorsLayer::new()
        .allow_origin(
            state
                .frontend_url
                .parse::<HeaderValue>()
                .expect("FRONTEND_URL must be a valid header value"),
        )
        .allow_methods([Method::GET, Method::POST, Method::DELETE])
        .allow_headers([AUTHORIZATION, CONTENT_TYPE]);

    Router::new()
        .nest("/api/v1", api)
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}
