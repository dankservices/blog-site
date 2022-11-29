use deadpool_postgres::Client;
use serde::{Serialize, Deserialize};
use time::Date;

use crate::error::ApiError;
use super::site_tag::SiteTag;

#[derive(Serialize, Deserialize, Debug, )]
pub struct Post {
    pub id: i32,
    pub series_id: i32,
    pub views: i32,
    pub title: String,
    pub short_description: String,
    pub slug: String,
    pub created: Date,
    // TODO: we'll need to figure out how to pass post content from the API
    // down the line - placeholder for now
    pub content: String,
    pub tags: Vec<SiteTag>,
}

impl Post {
    pub async fn get_all_previews(client: &Client) -> Result<Vec<PostPreview>, ApiError> {
        let stmt = client.prepare("SELECT id, series_id, views, title, short_description, slug, created FROM posts").await?;
        let mut posts = client.query(&stmt, &[]).await?
            .iter()
            .map(|row| PostPreview {
                id: row.get(0),
                series_id: row.get(1),
                views: row.get(2),
                title: row.get(3),
                short_description: row.get(4),
                slug: row.get(5),
                created: row.get(6),
                tags: Vec::new(),
            })
            .collect::<Vec<PostPreview>>();
        for mut post in posts.iter_mut() {
            post.tags = SiteTag::get_post_tags(post.id, client).await?;
        }
        Ok(posts)
    }

    pub async fn get_series_post_previews(series_id: i32, client: &Client) -> Result<Vec<PostPreview>, ApiError> {
        let stmt = client.prepare("SELECT id, views, title, short_description, slug, created FROM posts WHERE series_id = $1").await?;
        let mut posts = client.query(&stmt, &[&series_id]).await?
            .iter()
            .map(|row| PostPreview {
                id: row.get(0),
                series_id,
                views: row.get(1),
                title: row.get(2),
                short_description: row.get(3),
                slug: row.get(4),
                created: row.get(5),
                tags: Vec::new(),
            })
            .collect::<Vec<PostPreview>>();
        for mut post in posts.iter_mut() {
            post.tags = SiteTag::get_post_tags(post.id, client).await?;
        }
        Ok(posts)
    }

    pub async fn get_post_by_slug(slug: &str, client: &Client) -> Result<Self, ApiError> {
        let stmt = client.prepare("SELECT id, series_id, views, title, short_description, slug, created, content FROM posts WHERE slug = $1").await?;
        let row_opt = client.query_opt(&stmt, &[&slug]).await?;
        if row_opt.is_none() {
            return Err(ApiError::NotFound);
        }
        let row = row_opt.unwrap();
        let mut post = Self {
            id: row.get(0),
            series_id: row.get(1),
            views: row.get(2),
            title: row.get(3),
            short_description: row.get(4),
            slug: row.get(5),
            created: row.get(6),
            content: row.get(7),
            tags: Vec::new(),
        };
        post.tags = SiteTag::get_post_tags(post.id, client).await?;
        Ok(post)
    }
}

// same as `SeriesPost`, but without the content field
#[derive(Serialize, Deserialize, Debug)]
pub struct PostPreview {
    pub id: i32,
    pub series_id: i32,
    pub views: i32,
    pub title: String,
    pub short_description: String,
    pub slug: String,
    pub created: Date,
    pub tags: Vec<SiteTag>,
}