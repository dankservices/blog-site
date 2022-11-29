import Hero from "../components/home/Hero";
import useSWR from 'swr';
import { HomeData } from "./api/home";
import BlogTimeline from "../components/home/BlogTimeline";
import RecentSeries from "../components/home/RecentSeries";
import Loading from "../components/Loading";
import LiveServices from "../components/home/LiveServices";
import Head from "next/head";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error("Failed to fetch data");
  }
  const data: HomeData = await res.json();
  return data
}

export default function Home() {
  const { data, error } = useSWR('/api/home', fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <Loading />

  return (
    <div>
      <Head>
        <title>DankServices - Home</title>
      </Head>
      <Hero
        title={data.heroTitle}
        textContent={data.heroTextContent}
      />
      <div className="grid lg:grid-cols-3 grid-cols-1 gap-5 mx-16">
          <BlogTimeline posts={data.blogPosts} />
          <RecentSeries series={data.recentSeries} />
          <LiveServices services={data.liveServices} />
      </div>
    </div>
  )
}
