use actix_web::{HttpResponse, web, ResponseError};
use deadpool_postgres::{Pool, Client};

use crate::{
    models::series::Series, 
    error::ApiError
};

pub async fn get_all_series(db_pool: web::Data<Pool>) -> HttpResponse {
    let client: Client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let series = Series::get_all_previews(&client).await;
    match series {
        Ok(series) => HttpResponse::Ok().json(series),
        Err(e) => e.error_response()
    }
}

pub async fn get_series_by_slug(db_pool: web::Data<Pool>, slug: web::Path<String>) -> HttpResponse {
    let client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let series = match Series::get_series_by_slug(slug.into_inner(), &client).await {
        Ok(series) => series,
        Err(e) => return e.error_response()
    };
    HttpResponse::Ok().json(series)
}
