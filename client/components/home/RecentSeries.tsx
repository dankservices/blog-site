import { Accordion, Badge, Button } from "flowbite-react";
import { SeriesPreview, SiteTag } from "../../interfaces/Data";
import { HiArrowNarrowRight } from "react-icons/hi";
import HomeCard from "./HomeCard";
import { renderTags } from "../../lib/Rendering";
import Link from "next/link";


interface RecentSeriesProps {
    series: SeriesPreview[];
}

const renderSeriesAccordion = (series: SeriesPreview[]) => {
    // sort by most recent date
    let sortedSeries = series.sort((a, b) => {
        //todo fix this
        return b.views - a.views;
    })
    return sortedSeries.map((series, idx) => (
        <Accordion.Panel key={idx}>
            <Accordion.Title>
                {series.title}
            </Accordion.Title>
            <Accordion.Content>
                <div className="flex flex-row py-2 gap-2">
                    {renderTags(series.tags)}
                </div>
                {series.short_description}
                <Link href={`/series/${series.slug}`}>
                <Button color="gray" className="mt-2">
                    View Series
                    <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                </Button>
                </Link>
            </Accordion.Content>
        </Accordion.Panel>
    ))
}


export default function RecentSeries(props: RecentSeriesProps) {
    return (
        <HomeCard
            title="Recently updated Series"
            content={
                <Accordion>
                    {renderSeriesAccordion(props.series)}
                </Accordion>
            }
            />
    )
}