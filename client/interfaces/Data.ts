export interface PostPreview {
    id: number
    series_id?: number
    title: string;
    date: string;
    short_description: string;
    slug: string;
    tags: SiteTag[];
}

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

export interface Service {
    id: number;
    image: string;
    name: string;
    description: string;
    subdomain: string;
    tags: SiteTag[];
}

export interface SiteTag {
    name: string;
    color: string;
}

export interface Series {
    id: number;
    views: number;
    title: string;
    long_description: string;
    slug: string;
    updated: number[];
    created: number[];
    tags: SiteTag[];
    posts: PostPreview[];
}

export interface Post {
    id: number;
    series_id?: number;
    views: number;
    title: string;
    short_description: string;
    date: string;
    content: string;
    slug: string;
    tags: SiteTag[];
}