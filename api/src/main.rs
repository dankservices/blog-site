use actix_web::{HttpServer, App, web};
use ::config::Config;
use dotenv::dotenv;
use tokio_postgres::NoTls;

use crate::{
    routes::{
        series::{
            get_all_series,
            get_series_by_slug
        },
        post::{
            get_all_posts,
            get_post_by_slug
        },
        services::get_all_services
    },
    config::ApiConfig,
};


mod routes;
mod models;
mod config;
mod error;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let built_config = Config::builder()
        .add_source(::config::Environment::default())
        .build()
        .unwrap();
        
    let config: ApiConfig = built_config.try_deserialize().unwrap();
    // Using NoTls for initial implementation, will add TLS later
    let pool = config.pg_config.create_pool(None, NoTls).unwrap();
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/series")
                            .route("", web::get().to(get_all_series))
                            .route("/{slug}", web::get().to(get_series_by_slug))
                    )
                    .service(
                        web::scope("/posts")
                            .route("", web::get().to(get_all_posts))
                            .route("/{slug}", web::get().to(get_post_by_slug))
                    )
                    .service(
                        web::scope("/services")
                            .route("", web::get().to(get_all_services))
                    )
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
