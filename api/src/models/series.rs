use time::Date;
use serde::{Serialize, Deserialize};
use deadpool_postgres::Client;

use crate::error::ApiError;

use super::{
    site_tag::SiteTag,
    post::{Post, PostPreview},
};

#[derive(Serialize, Deserialize, Debug)]
pub struct Series {
    pub id: i32,
    pub views: i32,
    pub title: String,
    pub long_description: String,
    pub slug: String,
    pub created: Date,
    pub updated: Date,
    pub tags: Vec<SiteTag>,
    pub posts: Vec<PostPreview>,
}

impl Series {
    /*
    pub async fn get_all(client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT id, views, title, long_description, slug, created, updated FROM series").await?;
        let mut series = client.query(&stmt, &[]).await?
            .iter()
            .map(|row| Self {
                id: row.get(0),
                views: row.get(1),
                title: row.get(2),
                long_description: row.get(3),
                slug: row.get(4),
                created: row.get(5),
                updated: row.get(6),
                tags: Vec::new(),
                posts: Vec::new(),
            })
            .collect::<Vec<Self>>();
        for mut series in series.iter_mut() {
            series.tags = SiteTag::get_series_tags(series.id, client).await?;
        }
        for mut series in series.iter_mut() {
            series.posts = Post::get_series_post_previews(series.id, client).await?;
        }
        Ok(series)    
    }
    */

    pub async fn get_all_previews(client: &Client) -> Result<Vec<SeriesPreview>, ApiError> {
        let stmt = client.prepare("SELECT id, views, title, short_description, slug, created, updated FROM series").await?;
        let mut series = client.query(&stmt, &[]).await?
            .iter()
            .map(|row| SeriesPreview {
                id: row.get(0),
                views: row.get(1),
                title: row.get(2),
                short_description: row.get(3),
                slug: row.get(4),
                created: row.get(5),
                updated: row.get(6),
                tags: Vec::new(),
            })
            .collect::<Vec<SeriesPreview>>();
            for mut series in series.iter_mut() {
                series.tags = SiteTag::get_series_tags(series.id, client).await?;
            }
        Ok(series)    
    }
    /*
    pub async fn get_series_by_id(id: i32, client: &Client) -> Result<Self, ApiError> {
        let stmt = client.prepare("SELECT id, views, title, long_description, slug, created, updated FROM series WHERE id = $1").await?;
        let row = client.query_one(&stmt, &[&id]).await?;
        let mut series = Self {
            id: row.get(0),
            views: row.get(1),
            title: row.get(2),
            long_description: row.get(3),
            slug: row.get(4),
            created: row.get(5),
            updated: row.get(6),
            tags: Vec::new(),
            posts: Vec::new(),
        };
        series.tags = SiteTag::get_series_tags(series.id, client).await?;
        series.posts = Post::get_series_post_previews(series.id, client).await?;
        Ok(series)
    }
    */
    pub async fn get_series_by_slug(slug: String, client: &Client) -> Result<Self, ApiError> {
        let stmt = client.prepare("SELECT id, views, title, long_description, slug, created, updated FROM series WHERE slug = $1").await?;
        let row_opt = client.query_opt(&stmt, &[&slug]).await?;
        if row_opt.is_none() {
            return Err(ApiError::NotFound);
        }
        let row = row_opt.unwrap();
        let mut series = Self {
            id: row.get(0),
            views: row.get(1),
            title: row.get(2),
            long_description: row.get(3),
            slug: row.get(4),
            created: row.get(5),
            updated: row.get(6),
            tags: Vec::new(),
            posts: Vec::new(),
        };
        series.tags = SiteTag::get_series_tags(series.id, client).await?;
        series.posts = Post::get_series_post_previews(series.id, client).await?;
        Ok(series)
    }
}


#[derive(Serialize, Deserialize, Debug)]
pub struct SeriesPreview {
    pub id: i32,
    pub views: i32,
    pub title: String,
    pub short_description: String,
    pub slug: String,
    pub created: Date,
    pub updated: Date,
    pub tags: Vec<SiteTag>,
}