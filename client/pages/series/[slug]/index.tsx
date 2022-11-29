import { useRouter } from "next/router";
import { Series } from "../../../interfaces/Data";
import useSWR from 'swr';
import Loading from "../../../components/Loading";
import Head from "next/head";
import SeriesMainCard from "../../../components/series/SeriesMainCard";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (res.status !== 200) {
        throw new Error("Failed to fetch data");
    }
    const data: Series = await res.json();
    return data
}

export default function SeriesHome() {
    const router = useRouter();
    const { slug } = router.query;
    const { data, error } = useSWR(`/api/series/${slug}`, fetcher);
    if (error) {
        return <div>Failed to load</div>
    }
    if (!data) return <Loading />
    return (
        <>
            <Head>
                <title>DankServices - {data.title}</title>
            </Head>
            <div className="mx-16">
                <h1 className="my-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {data.title}
                </h1>
                <div>
                    <SeriesMainCard series={data} />
                </div>
            </div>
        </>
    )
}

