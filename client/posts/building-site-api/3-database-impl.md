---
title: 'Building an API for DankServices'
subTitle: 'Database Design and Implementation'
shortDescription: 'Bye bye static .ts files!'
date: '2022-11-16'
---

# SET THEORY!

It's getting more and more difficult to manage the data layer in static TypeScript files as we progress through this series. We're going to need to start thinking about how to manage our data in a more scalable way. We're going to need to start thinking about databases.

We'll be using PostgreSQL as our database layer for this series. If you're not familiar with PostgreSQL, it's a relational database management system (RDBMS) that is open source and free to use. It's a very popular database system and is used by many large companies. By the end of this post, we'll have our API fully backed by our shiny new database!

---
### Schema Design
Before we get started with the code, we should put some thought into our database schema. We'll be using a relational database, so we'll need to think about how we want to structure our data. Our data will have the following relationships:

- A series can have many posts
- A post can only belong to one series
- Posts, series, and services can all have many tags
- A tag can be used by many posts, series, and services

So, we'll want to implement a couple of relationships in our database. We'll need a one-to-many relationship between series and posts, and a many-to-many relationship between posts, series, and services and tags. Let's write some SQL to create our database!

### Creating the Database

First things first, we will have to create a database for us to use and an admin user to manage it:

```sql
CREATE DATABASE dank_services;
CREATE USER sa_dank_admin with encrypted password 'obviously-not-real-pw';
GRANT ALL PRIVILIGES ON DATABASE dank_services TO sa_dank_admin;
```


Now that that's out of the way, let's start with the simplest table: Tags. Tags will only have two fields: a name and a color. The name can serve as a primary key, as we will not have two identically named tags.

```sql
USE dank_services;
CREATE TABLE site_tags (
    tag_name VARCHAR(255) PRIMARY KEY,
    color VARCHAR(255) NOT NULL
);
```

Now that the easiest one is out of the way, let's get to the tougher ones. Next up is services:

```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    image VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subdomain VARCHAR(255) NOT NULL
);
CREATE TABLE service_tags (
    service_id INT,
    tag_name VARCHAR(255),
    PRIMARY KEY (service_id, tag_name),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_name) REFERENCES site_tags(tag_name) ON DELETE CASCADE
);
```

We create two tables - One to house the services themselves and one to house the relationship between services and tags. The relationship table has a composite primary key, which is a combination of the service ID and the tag name. This is because we don't want to have duplicate relationships between services and tags. We also have two foreign keys, which are references to the primary keys of the other tables. This is how we enforce the relationships between the tables.

Next up is series:

```sql
CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    views INT NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created DATE NOT NULL,
    updated DATE NOT NULL
);
CREATE TABLE series_tags (
    series_id INT,
    tag_name VARCHAR(255),
    PRIMARY KEY (series_id, tag_name),
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_name) REFERENCES site_tags(tag_name) ON DELETE CASCADE
);
```
Nothing too different here - just creating the series table and the relationship table between series and tags.

Finally, we have posts:

```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    series_id INT,
    views INT NOT NULL DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    long_description TEXT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created DATE NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE
);
CREATE TABLE post_tags (
    post_id INT,
    tag_name VARCHAR(255),
    PRIMARY KEY (post_id, tag_name),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_name) REFERENCES site_tags(tag_name) ON DELETE CASCADE
);
```

Only thing different here is that we have a foreign key on the post table that references the series table. This is how we enforce the one-to-many relationship between series and posts.

### Database Implementation

Now that we have our database designed, let's implement! First thing - we will execute all of the SQL we wrote on a Postgres instance to create our database schema. After we've done that, we need to populate the database with some test data. Let's use this series as our test data! The (painful to write) seed script can be found at `api/sql/seed.sql`.

Now that that is out of the way, let's write some Rust! 🦀

### Creating the Database Connection
Before we get crackin' on our model impl blocks, we're going to need to add a couple of dependencies, both Postgres related and not. We will need some way of handling configuration files for our database connection string, so we'll be using the `config` and `dotenv` crates, along with `derive_more` to make our lives a bit easier:

```
╰─>$ cargo add config dotenv derive_more
```

As far as postgres related crates, we want our database connection to be asynchronous, so we'll be using `tokio-postgres` and `deadpool-postgres` to manage our connection pool, along with some helper crates:

```
╰─>$ cargo add tokio-postgres deadpool-postgres --features deadpool-postgres/serde --features tokio-postgres/with-time-0_3
```

With the housekeeping out of the way, let's get implementing! First thing we need to do is to create a struct to house our config. We will extend this struct as needed down the line. We'll create a new module, `config.rs`, and put this struct in there:

```rust
// src/config.rs
use serde::Deserialize;

#[derive(Debug, Deserialize, Default)]
pub struct ApiConfig {
    pub server_addr: String,
    pub pg_config: deadpool_postgres::Config, 
}
```

We're rapidly approaching the point where we will get errors that can't be returned direct as an HttpResponse, so we're going to need to create a custom error type. We'll create a new module, `error.rs`, and put this in there:

```rust
// src/error.rs
use actix_web::{HttpResponse, ResponseError};
use deadpool_postgres::PoolError;
use derive_more::{Display, From};
use tokio_pg_mapper::Error as PgMapperError;
use tokio_postgres::error::Error as PgError;

#[derive(Debug, Display, From)]
pub enum ApiError {
    NotFound,
    PgError(PgError),
    PgMapperError(PgMapperError),
    PoolError(PoolError),
}

impl std::error::Error for ApiError {}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            ApiError::NotFound => HttpResponse::NotFound().finish(),
            ApiError::PoolError(ref err) => HttpResponse::InternalServerError().body(err.to_string()),
            _ => HttpResponse::InternalServerError().finish(),
        }
    }
}
```

We'll need give the `ApiError` enum more variants as we go, but this is a good start. Let's create a .env file in the root of our api directory and add our config details:

```
SERVER_ADDR=127.0.0.1:8000
PG_CONFIG.USER=sa_dank_admin
PG_CONFIG.PASSWORD=obviously-not-real-pw
PG_CONFIG.HOST=127.0.0.1
PG_CONFIG.PORT=5432
PG_CONFIG.DBNAME=dank_services
PG_CONFIG.POOL.MAX_SIZE=16
```

Then add a new config check at the top of our main function and build our config. After we build the config, we'll attempt to deserialize it into our `ApiConfig` struct:

```rust
// src/main.rs
// add imports
use dotenv::dotenv;
use ::config::Config;
//...

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    
    let built_config = Config::builder()
        .add_source(::config::Environment::default())
        .build()
        .unwrap();

    let config: ApiConfig = built_config.try_deserialize().unwrap();
    // ...
}
```

We're fine with these unwraps because there is no point handling the error - If the API launches without a config, it'll be useless anyway. Now that we have our config, we can create our database connection pool and add it to the server state: 

```rust
// src/main.rs
// ...
let pool = config.pg_config.create_pool(None, NoTls).unwrap();

HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(pool.clone()))
            // ...
```
Note we added `move` to our closure. We need to transfer ownership of the pool to the HttpServer, otherwise we'll get a compiler error.

Awesome! Now we've got a database connection pool for our models to query. Let's get to it!

### Extending the Tag Model
We'll need to implement a few methods on our models to utilize our new database.

First, we'll need to implement a method to get tags for each post, service, and series. We are starting with tags as they are a dependency for all of our other models. Let's start by adding an impl block to our `SiteTag` struct and adding a method to get tags for a post:

```rust
// src/models/site_tag.rs
// ...
impl SiteTag {
     pub async fn get_post_tags(post_id: i32, client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT site_tags.tag_name, site_tags.color FROM site_tags INNER JOIN post_tags ON site_tags.tag_name = post_tags.tag_name WHERE post_tags.post_id = $1").await?;
        let tags = client.query(&stmt, &[&post_id]).await?
            .iter()
            .map(|row| Self {
                name: row.get(0),
                color: row.get(1),
            })
            .collect::<Vec<Self>>();
        Ok(tags)       
    }
}
```

That query is a lot to unpack! We're looking for all tags that are associated with a post, so we filter on the post_id column. The table we are querying does not contain the tag color, so we need to join the `site_tags` table to get that information. We then map the results into a vector of `SiteTag` structs and return it.

We'll need to do the same thing for services and series, so let's add those methods to our impl block:

```rust
// src/models/site_tag.rs
// ...
    pub async fn get_series_tags(series_id: i32, client: &Client) -> Result<Vec<Self>, ApiError> {
        let stmt = client.prepare("SELECT site_tags.tag_name, site_tags.color FROM site_tags INNER JOIN series_tags ON site_tags.tag_name = series_tags.tag_name WHERE series_tags.series_id = $1").await?;
        let tags = client.query(&stmt, &[&series_id]).await?
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
        let tags = client.query(&stmt, &[&service_id]).await?
            .iter()
            .map(|row| Self {
                name: row.get(0),
                color: row.get(1),
            })
            .collect::<Vec<Self>>();
        Ok(tags)
    }
```
Cool! Now we can get tags for each model. Moving on...

### Extending the Post Model

Next up is the post model, as our series model depends on it. For right now, we only need 2 methods: one to get all post previews in a series, and one to get a post by its slug. Let's add those to our impl block:

```rust
// src/models/post.rs
// ...
impl Post {
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
        let row = client.query_one(&stmt, &[&slug]).await?;
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
```

We'll also implement a method to get all posts as previews - down the line we'll want to be able to show a list of all posts on the site. Let's add that to our impl block:

```rust
// src/models/post.rs
// ...
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
```

Notice that in all of our methods, we're getting our site tags with the method we implemented in the last section. Moving on to Series!

### Extending the Series Model

Kind of the same thing here - we need to get all series as previews, and get a series by its slug. Let's add those to our impl block:

```rust
// src/models/series.rs
// ...
impl Series {
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

    pub async fn get_series_by_slug(slug: String, client: &Client) -> Result<Self, ApiError> {
        let stmt = client.prepare("SELECT id, views, title, long_description, slug, created, updated FROM series WHERE slug = $1").await?;
        let row = client.query_one(&stmt, &[&slug]).await?;
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
```

### Extending the Service Model

Finally, we'll extend the service model - here we only need to get all of the services for right now.

```rust
// src/models/service.rs
// ...
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
        for mut service in services.iter_mut() {
            service.tags = SiteTag::get_service_tags(service.id, client).await?;
        }
        Ok(services)
    }
}
```

Awesome! Now we have all the methods we need to get all the data we need for our site. Let's move on to the routes!

### Routes

Now that we've implemented our database methods, let's update the routes we wrote in the last post! We currently have 5 routes - two for posts, two for series, and one for services. Let's start with the post routes. We'll delete the Lazy static we allocated and replace it with our database methods:

```rust
// src/routes/posts.rs
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
```

We'll do the same thing for the series routes:

```rust
// src/routes/series.rs
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
        Err(e) => HttpResponse::InternalServerError().json(e.to_string())
    }
}

pub async fn get_series_by_slug(db_pool: web::Data<Pool>, slug: web::Path<String>) -> HttpResponse {
    let client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let series = match Series::get_series_by_slug(slug.into_inner(), &client).await {
        Ok(series) => series,
        Err(e) => match e {
            ApiError::NotFound => return HttpResponse::NotFound().json(e.to_string()),
            _ => return HttpResponse::InternalServerError().json(e.to_string())
        }
    };
    HttpResponse::Ok().json(series)
}
```

And finally, the services route:

```rust
// src/routes/services.rs
use actix_web::{web, HttpResponse, ResponseError};
use deadpool_postgres::{Pool, Client};

use crate::{
    models::service::Service,
    error::ApiError,
};

pub async fn get_all_services(db_pool: web::Data<Pool>) -> HttpResponse {
    let client: Client = match db_pool.get().await.map_err(ApiError::PoolError) {
        Ok(client) => client,
        Err(e) => return e.error_response(),
    };
    let services = Service::get_all(&client).await;
    match services {
        Ok(services) => HttpResponse::Ok().json(services),
        Err(e) => e.error_response(),
    }
}
```

We did it! Our minimal API is now backed by a shiny new database! Next time, we'll dive into Next.js and modify our site to use the API we've built.