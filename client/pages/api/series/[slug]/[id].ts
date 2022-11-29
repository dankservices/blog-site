import { NextApiRequest, NextApiResponse } from "next";
import { Response404 } from "../../../../interfaces/Client";
import { Post } from "../../../../interfaces/Data";

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