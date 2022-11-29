use actix_web::{web, HttpResponse, ResponseError};
use deadpool_postgres::{Pool, Client};

use crate::{
    models::services::Service,
    error::ApiError,
};

pub async fn get_all_services(db_pool: web::Data<Pool>) -> HttpResponse {
    let client: Client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let services = Service::get_all(&client).await;
    println!("services: {:?}", services);
    match services {
        Ok(services) => HttpResponse::Ok().json(services),
        Err(e) => e.error_response(),
    }
}