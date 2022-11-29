use actix_web::{HttpResponse, ResponseError};
use deadpool_postgres::PoolError;
use derive_more::{Display, From};
use tokio_postgres::error::Error as PgError;

#[derive(Debug, Display, From)]
pub enum ApiError {
    NotFound,
    PgError(PgError),
    PoolError(PoolError),
}

impl std::error::Error for ApiError {}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            ApiError::NotFound => HttpResponse::NotFound().body("<h1>404: Not Found</h1>"),
            ApiError::PoolError(ref err) => HttpResponse::InternalServerError().body(err.to_string()),
            _ => HttpResponse::InternalServerError().finish(),
        }
    }
}