---
title: 'Building an API for DankServices'
subTitle: 'Dynamic API Routing'
shortDescription: 'To [slug] or not to [slug]?'
date: '2022-11-16'
---

# Welcome back! 
We left off last post having just implemented our first dummy route for getting all of our series. Now, we'll be implementing the rest of our routes, and we'll be doing so in a dynamic fashion. We already use dynamic routing on the client side through the Next.js router, so this should mesh well with our API.

Without further ado, let's get started! 🦀

---
### Series Routing

We left off having just implemented our `get_all_series()` route in `api/src/routes/series.rs`. Let's take a look at the code:

```rust
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
We're fine using dummy models for now, but what if we want to get an individual Series? We can accomplish this by creating a dynamic route with actix-web. First off, lets move that series vector out of the function and into the module as a `const`. this will serve as out "database" for the time being. In Rust, in order to allocate a static value at runtime, we will have to use the `once_cell` library. This library will also be useful for generating static configuration variables down the line. Let's add it to our project:

```
╰─>$ cargo add once_cell
```

Now, we can add our `SERIES_PREVIEWS` constant to our `api/src/routes/series.rs` file:

```rust
use actix_web::{Responder, HttpResponse};
use once_cell::sync::Lazy;

use crate::models::series::SeriesPreview;

static SERIES_PREVIEWS: Lazy<Vec<SeriesPreview>> = Lazy::new(|| {
    vec![
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
    ]
});


pub async fn get_all_series() -> impl Responder {
    HttpResponse::Ok().json(&*SERIES_PREVIEWS)
}
```
The reason we use `&*SERIES_PREVIEWS` is because we want to dereference the Lazy object and get a reference to the inner value. Now that we have our "database" working, let's add a dynamic route! We want this route to return a single series, so we'll add a "series table" to our "database"

```rust
// routes/series.rs
// update import to include actix-web::web
use actix_web::{Responder, HttpResponse, web};

...

static SERIES: Lazy<Vec<Series>> = Lazy::new(|| {
    vec![
        Series {
            id: 1,
            views: 0,
            title: "Test Series".to_string(),
            long_description: "This is a test series".to_string(),
            slug: "test-series".to_string(),
            date: "2020-01-01".to_string(),
            tags: vec![],
            posts: vec![]
        },
        Series {
            id: 2,
            views: 0,
            title: "Test Series 2".to_string(),
            long_description: "This is a test series 2".to_string(),
            slug: "test-series-2".to_string(),
            date: "2020-01-01".to_string(),
            tags: vec![],
            posts: vec![]
        }
    ]
});

pub async fn get_series_by_slug(slug: web::Path<String>) -> impl Responder {
    let series = SERIES.iter().find(|s| s.slug == *slug);
    match series {
        Some(s) => HttpResponse::Ok().json(s),
        None => HttpResponse::NotFound().finish()
    }
}
```

Here, we're using the `web::Path` extractor to get the slug from the URL. We then use the `find()` method on `SERIES` to find the series with the matching slug. If we find a series, we return it as JSON, otherwise we return a 404. Now, let's add this route to our HttpServer:

```rust
// main.rs
// add new route import
use crate::routes::{
    series::{
        get_all_series,
        get_series_by_slug
    }
};

...
// inside fn main()
.service(
    web::scope("/series")
    .route("", web::get().to(get_all_series))
    .route("/{slug}", web::get().to(get_series_by_slug))
)
```

Let's give our shiny new dynamic route a shot!

```
╰─>$ curl localhost:8000/api/series/test-series | json_pp
{
   "date" : "2020-01-01",
   "id" : 1,
   "long_description" : "This is a test series",
   "posts" : [],
   "slug" : "test-series",
   "tags" : [],
   "title" : "Test Series",
   "views" : 0
```

It works! 🎉 We now have our basic routes working for Series and we can now move on to the next section.

### Post Routing

For posts, we will be implementing the same routes as we did for series. We'll be implementing `get_all_posts()` and `get_post_by_slug()`, along with our "database":

```rust
// routes/series_post.rs
use actix_web::{web, HttpResponse, Responder};
use once_cell::sync::Lazy;

use crate::models::series_post::{SeriesPost, SeriesPostPreview};

static SERIES_POST_PREVIEWS: Lazy<Vec<SeriesPostPreview>> = Lazy::new(|| {
    vec![
        SeriesPostPreview {
            id: 1,
            series_id: 1,
            views: 0,
            title: "Test Series Post".to_string(),
            short_description: "This is a test series post".to_string(),
            slug: "test-series-post".to_string(),
            date: "2020-01-01".to_string(),
            tags: vec![],
        },
        SeriesPostPreview {
            id: 2,
            series_id: 1,
            views: 0,
            title: "Test Series Post 2".to_string(),
            short_description: "This is a test series post 2".to_string(),
            slug: "test-series-post-2".to_string(),
            date: "2020-01-01".to_string(),
            tags: vec![],
        },
    ]
});

static SERIES_POSTS: Lazy<Vec<SeriesPost>> = Lazy::new(|| {
    vec![
        SeriesPost {
            id: 1,
            series_id: 1,
            views: 0,
            title: "Test Series Post".to_string(),
            short_description: "This is a test series post".to_string(),
            slug: "test-series-post".to_string(),
            date: "2020-01-01".to_string(),
            content: "Placeholder".to_string(),
            tags: vec![],
        },
        SeriesPost {
            id: 2,
            series_id: 1,
            views: 0,
            title: "Test Series Post 2".to_string(),
            short_description: "This is a test series post 2".to_string(),
            slug: "test-series-post-2".to_string(),
            date: "2020-01-01".to_string(),
            content: "Placeholder".to_string(),
            tags: vec![],
        },
    ]
});

pub async fn get_all_series_posts() -> impl Responder {
    HttpResponse::Ok().json(&*SERIES_POST_PREVIEWS)
}

pub async fn get_series_post_by_slug(slug: web::Path<String>) -> impl Responder {
    let series_post = SERIES_POSTS
        .iter()
        .find(|series_post| series_post.slug == *slug);
    match series_post {
        Some(sp) => HttpResponse::Ok().json(sp),
        None => HttpResponse::NotFound().finish()
    }
}
```

We'll add the routes to the HttpServer under the "/posts" scope:

```rust
// main.rs
// update route imports
use crate::routes::{
    series::{
        get_all_series,
        get_series_by_slug
    },
    series_post::{
        get_all_series_posts,
        get_series_post_by_slug
    }
};

...

// inside fn main(), inside the /api scope
.service(
    web::scope("/posts")
        .route("", web::get().to(get_all_series_posts))
        .route("/{slug}", web::get().to(get_series_post_by_slug))
)
```

Testing it out with curl:

```
╰─>$ curl localhost:8000/api/series-post | json_pp
[
   {
      "date" : "2020-01-01",
      "id" : 1,
      "series_id" : 1,
      "short_description" : "This is a test series post",
      "slug" : "test-series-post",
      "tags" : [],
      "title" : "Test Series Post",
      "views" : 0
   },
   {
      "date" : "2020-01-01",
      "id" : 2,
      "series_id" : 1,
      "short_description" : "This is a test series post 2",
      "slug" : "test-series-post-2",
      "tags" : [],
      "title" : "Test Series Post 2",
      "views" : 0
   }
]
╰─>$ curl localhost:8000/api/series-post/test-series-post | json_pp
{
   "content" : "Placeholder",
   "date" : "2020-01-01",
   "id" : 1,
   "series_id" : 1,
   "short_description" : "This is a test series post",
   "slug" : "test-series-post",
   "tags" : [],
   "title" : "Test Series Post",
   "views" : 0
}
```
Cool! The hard work is done. We now have our basic routes working for Series and Series Posts. We can now move on to the next section.

### Service Routing
Service routing will be a bit simpler, as we only need a route to get all services for rendering on the `Services` page. We'll be implementing `get_all_services()` and our "database":

```rust
// routes/services.rs
use actix_web::{Responder, HttpResponse};
use once_cell::sync::Lazy;

use crate::models::service::Service;

static SERVICES: Lazy<Vec<Service>> = Lazy::new(|| {
    vec![
        Service {
            id: 1,
            image: "/servicetestimg.png".to_string(),
            name: "Test Service".to_string(),
            description: "This is a test service".to_string(),
            subdomain: "test-service".to_string(),
            tags: vec![]
        },
        Service {
            id: 2,
            image: "/servicetestimg.png".to_string(),
            name: "Test Service 2".to_string(),
            description: "This is a test service 2".to_string(),
            subdomain: "test-service-2".to_string(),
            tags: vec![]
        }
    ]
});

pub async fn get_all_services() -> impl Responder {
    HttpResponse::Ok().json(&*SERVICES)
}
```

Easy! We'll add the route to the HttpServer under the "/services" scope:

```rust
// main.rs
// update route imports
use crate::routes::{
    series::{
        get_all_series,
        get_series_by_slug
    },
    series_post::{
        get_all_series_posts,
        get_series_post_by_slug
    },
    services::get_all_services
};

...

// inside fn main(), inside the /api scope
.service(
    web::scope("/services")
        .route("", web::get().to(get_all_services))

)
```

And test with curl:

```
╰─>$ curl localhost:8000/api/services | json_pp
[
   {
      "description" : "This is a test service",
      "id" : 1,
      "image" : "/servicetestimg.png",
      "name" : "Test Service",
      "subdomain" : "test-service",
      "tags" : []
   },
   {
      "description" : "This is a test service 2",
      "id" : 2,
      "image" : "/servicetestimg.png",
      "name" : "Test Service 2",
      "subdomain" : "test-service-2",
      "tags" : []
   }
]
```
Awesome! While this an extremely simple implementation, we have a nice base to start implementing our API framework. In the next post, we'll be adding a database layer to our API, and then we'll be able to start implementing the frontend.
