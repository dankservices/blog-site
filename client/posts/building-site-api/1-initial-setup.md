---
title: 'Building an API for DankServices'
subTitle: 'Setup and Initial Implementation'
shortDescription: 'First series post, wahoo!'
date: '2022-11-15'
---


# Welcome to DankServices!
I started creating this site with the intent of implementing services I find interesting. Before we get to that, however, we need to get the site up and running! Special thanks to [Flowbite](https://flowbite-react.com/) for making the front-end work much easier. I am pretty bad at styling (as you can probably tell), so the ready-made React components were a great help! 

Currently, the site is just a Next.js web application that converts markdown files stored in `posts/` to HTML via SSR. Once converted, it styles them with `@tailwindcss/typography` and sends the result to the client. This is an OK approach for the time being, but my first project will be setting up a REST API for interfacing with the site. This will address several issues:

1. Data persistence. Site data is currently limited to test data stored in `test/data/Home.ts` and `test/data/Series.ts`. An API will allow us to store data in a PostgreSQL instance and access it with CRUD (read only at first) operations.

2. Post attribution. While we will definitely not be tracking individual users, an API will allow us to track important stuff like:
    - How many times a post has been accessed?
    - Which series are most popular?
    - Which services are getting the most utilization?

3. Authentication and Authorization. This will definitely not be in v1 of the API - It's a large undertaking and right now, I'm just trying to get the site up and running. Down the line,
these two things will be essential for implementing things like SSO for all of the services and RBAC.

This may be overengineering for a simple blog site, but overengineering is one of my favorite things to do! Let's get started!

---
## Initializing our API Project
Our current project structure is:
```
dankservices-site/
└── client/
    ├── pages/
    ├── lib/
    ├── components/
    ...

```

To get started, let's initialize a new Rust binary in the root project directory named `api`:

```
╰─>$ cargo new --bin api
     Created binary (application) `api` package
```
which will leave our project structure looking like this:

```
dankservices-site/
├── client/
│   ├── pages/
│   ├── lib/
│   ├── components/
│    ...
└── api/
    ├── src/
    │   └── main.rs
    └── Cargo.toml
```

We will also need to add dependencies to get started. Let's `cd` into `api/` and add `actix-web`, `serde`, and `serde_json`:

```
╰─>$ cargo add actix-web serde serde_json time --features serde/derive --features time/serde
```

Ok, we are ready to get started with our implementation! 🙂

---

## Initial actix-web Server Implementation
### Planning

Before we start implementing, we should begin by planning out our API architecture and data structures. Currently we have 6 data interfaces implemented in our client.
The nice thing about using TypeScript with a Rust backend is that we can implement structs in Rust to match our interfaces directly, then return those as the response payload! Thios will make it easy to both implement existing test interfaces and extend our API in the future. Our current interfaces are as follows (located in `client/interfaces/Data.ts`):

- `Series`
- `SeriesPreview`
- `SeriesPost`
- `SeriesPostPreview`
- `Service`
- `SiteTag`

We can implement these interfaces 1-1 in Rust using `serde`, but what about our database layer? Looking at these interfaces, four of them are clearly related: SeriesPost + SeriesPostPreview and Series + SeriesPreview. We could simply have one database table for each of these, bringing us up to 4 tables (we will also need some association tables, but we can get to those later):

- `series`
- `posts`
- `site_tags`
- `services`

We have our data structures roughly planned out. Now, we should take a look at the API structure. We will likely not need to get tags individually for now, so let's table that endpoint. We will definitely need endpoints for getting Series, SeriesPosts, and Services. We'll start with the plan of implementing our endpoints as follows and adjust as needed:

- /services for getting an array of Services
- /series for getting an array of SeriesPreviews
- /series/[id] for getting an individual Series
- /posts for getting an array of SeriesPostPreviews
- /posts/[id] for getting an individual SeriesPost

For now, we will only be dealing with GET requests - we will want to add an auth stack before allowing any other type of request.

Cool! We have our implementation roughly planned out. Let's write some Rust!

### Hello World! Server
The first thing we need to do is get a simple Actix hello world server up and running. Let's open up `main.rs` and replace the generated code with the following:

```rust
use actix_web::{HttpServer, App, web};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(web::resource("/").to(|| async { "Hello world!" }))
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
```

Actix provides a convienent `HttpServer` constructor to build, bind, and run a webserver. Let's see it in action! Runing the webserver with `cargo run` and running `curl localhost:8000` in another tty gives the following output:

```
╰─>$ curl localhost:8000
Hello world!⏎
```

Awesome! We now have a functioning Actix webserver. Time to extend! We'll create two new folders in `api/src/`: `models/` and `routes/`. We can declare them as modules by adding a blank file in each of them named `mod.rs`, then adding two lines of code in main.rs:

```rust
//imports

mod routes;
mod models;

//code
```

Let's build some models!

### Data Models
Building our data models will be relatively simple thanks to TypeScript. We already have our structures defined as interfaces, so we just need to convert them to Rust! Let's start by creating files in the models folder for each of the database tables we planned:

- `series.rs` for `series`
- `post.rs` for `posts`
- `site_tag.rs` for `site_tags`
- `services.rs` for `services`

We'll then add these to `api/src/models/mod.rs` as public modules - they will need to be accessible from our routes to use them as responses.

```rust
// models/mod.rs
pub mod series;
pub mod post;
pub mod site_tag;
pub mod service;
```

Let's start with SiteTag, as it is present as a field on all of the other data structures. 

```rust
// models/site_tag.rs
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct SiteTag {
    pub name: String,
    pub color: String,
}
```
Thinking forward, we can use name as a primary key in our database - no two tags should be named the same. Now, let's do the Service model, as it doesn't have a preview struct required:

```rust
// models/service.rs
use serde::{Serialize, Deserialize};

use super::site_tag::SiteTag;

#[derive(Serialize, Deserialize, Debug)]
pub struct Service {
    pub id: i32,
    pub image: String,
    pub name: String,
    pub description: String,
    pub subdomain: String,
    pub tags: Vec<SiteTag>
}
```

The only real difference here is that we import `SiteTag` for use in the `tags` field. Now, let's do the SeriesPost models, as we will need to use them in the Series model:

```rust
// models/post.rs
use super::site_tag::SiteTag;
use time::Date;

#[derive(Serialize, Deserialize, Debug)]
pub struct SeriesPost {
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

// same as `SeriesPost`, but without the content field
#[derive(Serialize, Deserialize, Debug)]
pub struct SeriesPostPreview {
    pub id: i32,
    pub series_id: i32,
    pub views: i32,
    pub title: String,
    pub short_description: String,
    pub slug: String,
    pub created: Date,
    pub tags: Vec<SiteTag>,
}
```

And then the Series models:

```rust
// models/series.rs
use serde::{Serialize, Deserialize};
use time::Date;

use super::{
    site_tag::SiteTag, 
    series_post::SeriesPostPreview
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
    pub posts: Vec<SeriesPostPreview>,
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
```

With all of our interfaces implemented, we can now start implementing our routes!

### Routes
There are two ways to implement routes in Actix - using the macro method: 
```rust
// taken from actix-web docs
#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```
or the manual method:
```rust
// taken from actix-web docs
async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/hello", web::get().to(manual_hello))
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
```
We will be using the latter, as it allows us to group routes together and prefix them with a common path by using `web::scope()` more easily. As we don't have a database set up yet, we will start by manually generating structs to respond with. Let's start by creating a file in `api/src/routes/` named `series.rs` and adding the following code:

```rust
use actix_web::{Responder, HttpResponse};

use crate::models::series::SeriesPreview;

pub async fn get_all_series() -> impl Responder {
    // generate a vec of SeriesPreviews manually for now
    let series: Vec<SeriesPreview> = vec![
        SeriesPreview {
            id: 1,
            views: 0,
            title: "Test Series".to_string(),
            short_description: "This is a test series".to_string(),
            slug: "test-series".to_string(),
            date: "2020-01-01".to_string(),
            tags: vec![]
        },
        SeriesPreview {
            id: 2,
            views: 0,
            title: "Test Series 2".to_string(),
            short_description: "This is a test series 2".to_string(),
            slug: "test-series-2".to_string(),
            date: "2020-01-01".to_string(),
            tags: vec![]
        }
    ];
    HttpResponse::Ok().json(series)
}
```
We add the new handler as a public module in `api/src/routes/mod.rs`, then we can add our new route to `api/src/main.rs`:

```rust
// api/src/main.rs
...
use crate::routes::series::get_all_series;
...

fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/series")
                            .route("", web::get().to(routes::series::get_all_series))
                    )
            )
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
```
Let's give it a shot! By running `cargo run` in the `api` directory, then curl-ing `http://localhost:8000/api/series` we see the following JSON response:
```json
[
    {
        "id": 1,
        "views": 0,
        "title": "Test Series",
        "short_description": "This is a test series",
        "slug": "test-series",
        "date": "2020-01-01",
        "tags": []
    },
    {
        "id": 2,
        "views": 0,
        "title": "Test Series 2",
        "short_description": "This is a test series 2",
        "slug": "test-series-2",
        "date": "2020-01-01",
        "tags": []
    }
]
```
Success! We'll leave it there for now. Next time we can start implementing the rest of our routes using dynamic pathing in Actix!

