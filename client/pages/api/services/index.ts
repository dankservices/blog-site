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
