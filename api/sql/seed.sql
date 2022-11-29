INSERT INTO site_tags (tag_name, color) VALUES
    ('Rust', 'indigo'),
    ('actix-web', 'success'),
    ('Backend', 'info'),
    ('TypeScript', 'indigo'),
    ('Next.js', 'success'),
    ('Frontend', 'info');

INSERT INTO series (views, title, short_description, long_description, slug, created, updated) VALUES (
    0,
    'Building a Backend API for DankServices with actix-web',
    'In this series, I will be building a backend REST API for this site using  Rust and PostgreSQL. I will be using the actix-web framework for the API and writing the database queries in Rust using the postgres library.',
    'This is a series of blog posts about building a backend API for this site with actix-web. This series will cover the basic features of building a webserver with Actix as well as more advanced features, such as using the actix-web middleware system to add authentication to the API. It will also touch on database design using PostgreSQL',
    'building-site-api',
    '2022-11-15',
    '2022-11-16'
);

INSERT INTO series_tags (series_id, tag_name) VALUES
    (1, 'Rust'),
    (1, 'actix-web'),
    (1, 'Backend');
    
INSERT INTO posts (series_id, views, title, short_description, long_description, slug, created, content) VALUES
    (1, 0, 'Building an API for DankServices - Initial Setup and Database Design', 'With the site now semi-working, its time to start building the backend API. This post will cover the initial setup of the project, and the database design for the site.', 'In this post, I will be introducing the series and explaining what it will cover.', '1-initial-setup', '2022-11-15', 'In this post, I will be introducing the series and explaining what it will cover.'),
    (1, 0, 'Building an API for DankServices - Dynamic API Routing', 'This post will cover the dynamic routing system for the API. This will allow the API to be easily extended with new endpoints, and will allow for the API to be easily documented.', 'In this post, I will be setting up the project and explaining the structure of the project.', '2-dynamic-routing', '2022-11-16', 'In this post, I will be setting up the project and explaining the structure of the project.'),
    (1, 0, 'Building an API for DankServices - Database Implementation', 'This post will cover the implementation of the database for the API. This will include the database schema and creating queries in the API.', 'In this post, I will be creating the database and explaining the structure of the database.', '3-database-impl', '2022-11-16', 'In this post, I will be creating the database and explaining the structure of the database'),
    (1, 0, 'Building an API for DankServices - Hitting our API with Next.js API routes', 'With our API functional and backed by a database, it is time to integrate it with our front end. In this post, we will be using Next.js API routes to fetch data from the back end.', 'In this post, I will be introducing the series and explaining what it will cover.', '4-calling-api', '2022-11-19', 'In this post, I will be introducing the series and explaining what it will cover.');

INSERT INTO post_tags (post_id, tag_name) VALUES
    (1, 'Rust'),
    (1, 'actix-web'),
    (1, 'Backend'),
    (2, 'Rust'),
    (2, 'actix-web'),
    (2, 'Backend'),
    (3, 'Rust'),
    (3, 'actix-web'),
    (3, 'Backend'),
    (4, 'TypeScript'),
	(4, 'Next.js'),
	(4, 'Frontend');