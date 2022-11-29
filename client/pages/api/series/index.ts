import { NextApiRequest, NextApiResponse } from 'next';
import { SeriesPreview } from '../../../interfaces/Data';

export interface SeriesIndexData {
    series: SeriesPreview[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SeriesIndexData>) {
    let response: SeriesPreview[] = await (await fetch('http://localhost:8000/api/series')).json()
    res.status(200).json({ series: response });
}
