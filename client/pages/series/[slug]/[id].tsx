import { Post } from "../../../interfaces/Data";
import useSwr from "swr";
import Loading from "../../../components/Loading";
import Head from "next/head";
import { useRouter } from "next/router";
import { getAllPostIds, getPostData } from "../../../lib/Posts";
import { InferGetStaticPropsType } from 'next'
import { GetStaticProps } from 'next'
import { Card } from "flowbite-react";

// files will be statically rendered by the server, but we still want to hit the API for
// popularity tracking and other things
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (res.status !== 200) {
        throw new Error("Failed to fetch data");
    }
    const data: Post = await res.json();
    return data
}

export default function SeriesEntry({ postData }: InferGetStaticPropsType<typeof getStaticProps> ) {
    const router = useRouter();
    const { slug, id } = router.query;
    const { data, error } = useSwr(`/api/series/${slug}/${id}`, fetcher);
    if (error) {
        console.log(error);
        return <div>Failed to load</div>
    }
    if (!data) return <Loading />
    return (
        <>
            <Head>
                <title>DankServices - {postData.title}</title>
            </Head>
            <Card className="xl:w-[40%] md:w-2/3 w-full mx-auto">
                <h1 className="text-4xl font-bold tracking-tight flex justify-start text-gray-900 dark:text-white">
                    {postData.title}
                </h1>
                <h2 className="text-2xl font-bold tracking-tight flex justify-start text-gray-700 dark:text-gray-300">
                    {postData.subTitle}
                </h2>
                <h4 className="text-lg font-bold tracking-tight flex justify-start text-gray-700 dark:text-gray-300">
                    {postData.shortDescription}
                </h4>
                <div className="text-md tracking-tight flex justify-start text-gray-700 dark:text-gray-300">
                    {postData.date}
                </div>
                <hr className="my-2 h-px bg-gray-200 border-0 dark:bg-gray-700" />
                <div className="flex justify-center">
                <div className="prose lg:prose-md dark:prose-invert w-full">
                    <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />                
                </div>
                </div>
            </Card>
        </>
    )
}

export async function getStaticPaths() {
    const paths = getAllPostIds();
    return {
        paths,
        fallback: false,
    };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    if (!params || !params.slug || !params.id || typeof params.slug !== "string" || typeof params.id !== "string") {
        return {
            notFound: true,
        }
    }
    const postData = await getPostData(params.slug, params.id);
    return {
        props: {
            postData,
        }
    }
}