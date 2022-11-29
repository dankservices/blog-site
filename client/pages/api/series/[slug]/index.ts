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

