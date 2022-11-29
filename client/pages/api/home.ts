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

const textContent = `
I created this site with the intent to build projects from the ground up using FOSS. 
Most of the projects I build and write about here will be written in Rust, but I will dip in to some other languages as necessary.
I'm currently working on a few projects, but I'm always looking for new ideas. If you have any suggestions, feel free to reach out to me via Email, GitHub, or Discord.
My contact information can be found in the footer or on the Contact page.
Feel free to send me any feedback you might have about the site or any of the services I'm writing. I'm always looking to improve my skills and learn new things.
Thanks for stopping by, and I hope you enjoy your stay!
`

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
