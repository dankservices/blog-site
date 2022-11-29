use actix_web::{web, HttpResponse, ResponseError};
use deadpool_postgres::{Pool, Client};

use crate::models::post::Post;
use crate::error::ApiError;

pub async fn get_all_posts(db_pool: web::Data<Pool>) -> HttpResponse {
    let client: Client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let posts = Post::get_all_previews(&client).await;
    match posts {
        Ok(posts) => HttpResponse::Ok().json(posts),
        Err(e) => e.error_response(),
    }

}

pub async fn get_post_by_slug(slug: web::Path<String>, db_pool: web::Data<Pool>) -> HttpResponse {
    let client: Client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let post = Post::get_post_by_slug(&slug, &client).await;
    match post {
        Ok(post) => HttpResponse::Ok().json(post),
        Err(e) => e.error_response(),
    }
}