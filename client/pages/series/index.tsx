import Head from "next/head";
import IndexCard from "../../components/series/IndexCard";
import useSWR from 'swr';
import Loading from "../../components/Loading";
import { SeriesIndexData } from "../api/series";
import { SeriesPreview } from "../../interfaces/Data";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (res.status !== 200) {
        throw new Error("Failed to fetch data");
    }
    const data: SeriesIndexData = await res.json();
    return data
}

const sliceMostPopular = (series: SeriesPreview[]) => {
    return series.sort((a, b) => {
        return b.views - a.views;
    }).slice(0, 3)
}

const sliceMostRecent = (series: SeriesPreview[]) => {
    return series.sort((a, b) => {
        return b.id - a.id;
    }).slice(0, 3)
}

export default function Series() {
    const { data, error } = useSWR('/api/series', fetcher);
    if (error) return <div>Failed to load</div>
    if (!data) return <Loading />

    return (
        <>
        <Head>
            <title>DankServices - Series</title>
        </Head>
        <div className="mx-16">
            <h1 className="my-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                Blog Series
            </h1>
            <div className=" my-4 grid lg:grid-cols-2 grid-cols-1 gap-4">
                <IndexCard cardTitle={"Most Popular"} cardSeries={sliceMostPopular(data.series)} /> 
                <IndexCard cardTitle={"Most Recent"} cardSeries={sliceMostRecent(data.series)} />   
            </div>
            <IndexCard cardTitle={"All Series"} cardSeries={data.series} search={true} />
        </div> 
        </>
    )
}