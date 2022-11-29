use deadpool_postgres::Client;
use serde::{Serialize, Deserialize};

use crate::error::ApiError;

#[derive(Serialize, Deserialize, Debug)]
pub struct SiteTag {
    pub name: String,
    pub color: String,
}

impl SiteTag {
    pub async fn get_post_tags(post_id: i32, client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT site_tags.tag_name, site_tags.color FROM site_tags INNER JOIN post_tags ON site_tags.tag_name = post_tags.tag_name WHERE post_tags.post_id = $1").await?;
        let tags_res = client.query(&stmt, &[&post_id]).await?;
        if tags_res.len() == 0 {
            println!("no tags found for post {}", post_id);
            return Ok(Vec::new());
        }
        let tags = tags_res
            .iter()
            .map(|row| Self {
                name: row.get(0),
                color: row.get(1),
            })
            .collect::<Vec<Self>>();
        Ok(tags)       
    }

    pub async fn get_series_tags(series_id: i32, client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT site_tags.tag_name, site_tags.color FROM site_tags INNER JOIN series_tags ON site_tags.tag_name = series_tags.tag_name WHERE series_tags.series_id = $1").await?;
        let tags_res = client.query(&stmt, &[&series_id]).await?;
        if tags_res.len() == 0 {
            println!("no tags found for series {}", series_id);
            return Ok(Vec::new());
        }
        let tags = tags_res
            .iter()
            .map(|row| Self {
                name: row.get(0),
                color: row.get(1),
            })
            .collect::<Vec<Self>>();
        Ok(tags)
    }

    pub async fn get_service_tags(service_id: i32, client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT site_tags.tag_name, site_tags.color FROM site_tags INNER JOIN service_tags ON site_tags.tag_name = service_tags.tag_name WHERE service_tags.service_id = $1").await?;
        let tags_res = client.query(&stmt, &[&service_id]).await?;
        if tags_res.len() == 0 {
            println!("no tags found for service {}", service_id);
            return Ok(Vec::new());
        }
        let tags = tags_res.iter()
            .map(|row| Self {
                name: row.get(0),
                color: row.get(1),
            })
            .collect::<Vec<Self>>();
        Ok(tags)
    }
}