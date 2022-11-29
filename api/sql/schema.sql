CREATE TABLE site_tags (
    tag_name VARCHAR(255) PRIMARY KEY,
    color VARCHAR(255) NOT NULL
);
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
