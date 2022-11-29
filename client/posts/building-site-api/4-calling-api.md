---
title: 'Building an API for DankServices'
subTitle: 'Calling our API from the client'
shortDescription: 'So fetch!'
date: '2022-11-15'
---

# Almost there!

We're getting close to having a fully functional API + database backing our client. We just need to replace our dummy API routes on the front end with fetch calls to our new API. If you're not familiar with Next.js API routes, you can read more about them [here](https://nextjs.org/docs/api-routes/introduction). They provide a handy way to run server side code from the client and also make our endpoints look a bit cleaner.

## Fetching data
We've already got a few of these routes set up in our `pages/api` directory. Let's take a look at the `pages/api/series/index.ts` file:

```ts
import { NextApiRequest, NextApiResponse } from 'next';
import { SeriesPreview } from '../../../interfaces/Data';
import { testSeriesPreviews } from '../../../test/data/Home';

export interface SeriesIndexData {
    series: SeriesPreview[]
}


export default function handler(req: NextApiRequest, res: NextApiResponse<SeriesIndexData>) {
    res.status(200)
        .json({
            series: testSeriesPreviews
        })
}
```

This route is currently returning the `testSeriesPreviews` data we've been using in our client. That data is in an array we import from our `test/Data.ts` file. We'll need to replace this with a call to our database using the fetch API. Let's do that now.

```ts
import { NextApiRequest, NextApiResponse } from 'next';
import { SeriesPreview } from '../../../interfaces/Data';

export interface SeriesIndexData {
    series: SeriesPreview[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SeriesIndexData>) {
    let response: SeriesPreview[] = await (await fetch('http://localhost:8000/api/series')).json()
    res.status(200).json({ series: response });
}

```

If we curl that endpoint, we get the following:

```
╰─>$ curl http://localhost:8000/api/series | json_pp
[
   {
      "created" : [
         2022,
         319
      ],
      "id" : 1,
      "short_description" : "In this series, I will be building a backend REST API for this site using  Rust and PostgreSQL. I will be using the actix-web framework for the API and writing the database queries in Rust using the postgres library.",
      "slug" : "building-site-api",
      "tags" : [
         {
            "color" : "info",
            "name" : "Backend"
         },
         {
            "color" : "indigo",
            "name" : "Rust"
         },
         {
            "color" : "success",
            "name" : "actix-web"
         }
      ],
      "title" : "Building a Backend API for DankServices with actix-web",
      "updated" : [
         2022,
         320
      ],
      "views" : 0
   }
]
```

We can see that this is the data we expect - our interface is as follows:
```ts
// interfaces/Data.ts
export interface SeriesPreview {
    id: number;
    views: number;
    title: string;
    short_description: string;
    slug: string;
    updated: number[];
    created: number[];
    tags: SiteTag[];
}
```

If we go to our series page at `http://localhost:3000/series` and take a look at the network tab of the dev tools, we can see that our data is now being fetched from our API. Nice! We can do the same thing for our other API routes.

```ts
// pages/api/series/[slug]/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Series } from "../../../../interfaces/Data";


export default async function handler(req: NextApiRequest, res: NextApiResponse<Series>) {
    let response: Series = await (await fetch(`http://localhost:8000/api/series/${req.query.slug}`)).json()
    res.status(200).json(response);
}
```

```ts
// pages/api/series/[slug]/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { Post } from "../../../../interfaces/Data";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Post>) {
    let response: Post = await (await fetch(`http://localhost:8000/api/posts/${req.query.id}`)).json()    
    res.status(200).json(response);

}
```

Cool! That's all of the endpoints we are currently using - we will implement the `services` queries when we get a service up and running.

These queries work great when the data is backing them, but they don't have any error handling! If we try to fetch a post that doesn't exist, our API server will return a 500 error. Let's add some error handling to both our API server and our client API routes.

We're currently using the `query_one()` method in our model methods to fetch a single row from the database. Handling this error is a lot more difficult than it would initially seem - It appears that the implementation was not designed for this use case. Per the project's owner: "The intended use case for query_one is if any number of rows other than exactly 1 is a programming error." Whoops! That's not what we want. We want to handle the case where a post doesn't exist. We can do this by using the `query_opt()` method instead, like so:

```rust
// src/models/series.rs

// ...
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
```

The `row_opt()` method will return an error in cases where we would want to throw a 500 error (database errors, etc), but it will return `None` if the query returns no rows. We can use this to throw a 404 error!

We'll do the same for our post model:

```rust
// src/models/post.rs

// ...
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
```
Now if we curl a route with a post that doesn't exist, we get a 404 error:

```
╰─>$ curl -I localhost:8000/api/series/this-series-does-not-exist
HTTP/1.1 404 Not Found
content-length: 0
date: Tue, 22 Nov 2022 21:38:42 GMT
```

Sweet! Our server side routes are now error handling. Let's do the same for our client side routes. We'll need to split our response and data statements to accomplish this. Starting with our series page:

```ts
import { NextApiRequest, NextApiResponse } from "next";
import { Series } from "../../../../interfaces/Data";
import { Response404 } from "../../../../interfaces/Client";

export default async function handler(req: NextApiRequest, res: NextApiResponse<Series | Response404>) {
    let response = await fetch(`http://localhost:8000/api/series/${req.query.slug}`)
    switch (response.status) {
        case 200: {
            let series: Series = await response.json()
            res.status(200).json(series);
            break;
        }
        case 404: {
            res.status(404).json({ message: "Series not found" });
            break;
        }
        default: {
            res.status(500).json({ message: "Internal server error" });
            break;
        }
    }
}
```

Notice we are using a union type to handle our response. We can do the same for our post page:

```ts
export default async function handler(req: NextApiRequest, res: NextApiResponse<Post | Response404>) {
    let response = await fetch(`http://localhost:8000/api/posts/${req.query.id}`)   
    switch (response.status) {
        case 200: {
            let post: Post = await response.json()
            res.status(200).json(post);
            break;
        }
        case 404: {
            res.status(404).json({ message: "Post not found" });
            break;
        }
        default: {
            res.status(500).json({ message: "Internal server error" });
            break;
        }
    }
}
```
And our service page: 

```ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Response404 } from '../../../interfaces/Client';
import { Service } from '../../../interfaces/Data';


export default async function handler(req: NextApiRequest, res: NextApiResponse<Service[] | Response404>) {
    let response = await fetch('http://localhost:8000/api/services')
    switch (response.status) {
        case 200: {
            let services: Service[] = await response.json()
            res.status(200).json(services);
            break;
        }
        case 404: {
            res.status(404).json({ message: "Services not found" });
            break;
        }
        default: {
            res.status(500).json({ message: "Internal server error" });
            break;
        }
    }
}
```

Our home page will be a little different. We need to hit three different endpoints to get all the data we need. We'll use the `Promise.all()` method to wait for all three requests to finish before we return the data to the client:

```ts
import { NextApiRequest, NextApiResponse } from "next";
import { Response404 } from "../../interfaces/Client";
import { Post, SeriesPreview, Service } from "../../interfaces/Data";

export interface HomeData {
    heroTitle: string,
    heroTextContent: string,
    heroButtonText?: string,
    heroButtonLink?: string,
    blogPosts: Post[],
    recentSeries: SeriesPreview[]
    liveServices: Service[]
}

// ...

export default async function handler(req: NextApiRequest, res: NextApiResponse<HomeData | Response404>) {
    let [posts, series, services] = await Promise.all([
        fetch('http://localhost:8000/api/posts'),
        fetch('http://localhost:8000/api/series'),
        fetch('http://localhost:8000/api/services')
    ])
    if (posts.status === 200 && series.status === 200 && services.status === 200) {
        let postsData = await posts.json();
        let seriesData = await series.json();
        let servicesData = await services.json();
        res.status(200).json({
            heroTitle: "Welcome to DankServices!",
            heroTextContent: textContent,
            blogPosts: postsData,
            recentSeries: seriesData,
            liveServices: servicesData
        });
    } else {
        res.status(500).json({ message: "Internal server error" });
    }
}

```
If we try curling our Next.js API endpoint, we'll see that it's working as expected:

```
╰─>$ curl localhost:3000/api/home
// Big block of JSON containing posts, series, and services
```

Awesome! All of our endpoints are now backed by our API. Next time, we'll add logging to our API so we can see what's going on under the hood.