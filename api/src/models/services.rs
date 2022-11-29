use deadpool_postgres::Client;
use serde::{Serialize, Deserialize};

use super::site_tag::SiteTag;
use crate::error::ApiError;

#[derive(Serialize, Deserialize, Debug)]
pub struct Service {
    pub id: i32,
    pub image: String,
    pub name: String,
    pub description: String,
    pub subdomain: String,
    pub tags: Vec<SiteTag>
}

impl Service {
    pub async fn get_all(client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT id, image, name, description, subdomain FROM services").await?;
        let mut services = client.query(&stmt, &[]).await?
            .iter()
            .map(|row| Self {
                id: row.get(0),
                image: row.get(1),
                name: row.get(2),
                description: row.get(3),
                subdomain: row.get(4),
                tags: Vec::new(),
            })
            .collect::<Vec<Self>>();
        println!("services: {:?}", services);
        for mut service in services.iter_mut() {
            service.tags = SiteTag::get_service_tags(service.id, client).await?;
        }
        Ok(services)
    }
}