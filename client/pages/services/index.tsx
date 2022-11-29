import useSWR from 'swr';
import Loading from "../../components/Loading";
import Head from "next/head";
import { Service } from "../../interfaces/Data";
import ServiceCard from "../../components/services/ServiceCard";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error("Failed to fetch data");
  }
  const data: Service[] = await res.json();
  return data
}

const renderServices = (services: Service[]) => {
  return services.map((service, idx) => {
    return (
      <ServiceCard service={service} key={idx} />
    )
  })
}

export default function Services() {
  const { data, error } = useSWR('/api/services', fetcher);
  if (error) return <div>Failed to load</div>
  if (!data) return <Loading />
  return (
    <>
      <Head>
        <title>DankServices - Services</title>
      </Head>
      <div className="mx-16">
        <h1 className=" mx-16 my-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Active Services
        </h1>
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-3">
          {renderServices(data)}
        </div>
      </div>
    </>
  )
}