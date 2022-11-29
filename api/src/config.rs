use serde::Deserialize;

#[derive(Debug, Deserialize, Default)]
pub struct ApiConfig {
    pub server_addr: String,
    pub pg_config: deadpool_postgres::Config,
}