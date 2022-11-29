import { Card, Timeline } from "flowbite-react";
import { Series } from "../../interfaces/Data";

import { HiCalendar, HiArrowNarrowRight } from "react-icons/hi";
import { renderTags } from "../../lib/Rendering";
import { Button } from "flowbite-react";
import Link from "next/link";

interface SeriesMainCardProps {
    series: Series
}

const renderSeriesTimeline = (series: Series) => {
    // sort by lowest id first
    let sortedEntries = series.posts.sort((a, b) => {
        return a.id - b.id;
    })
    return sortedEntries.map((entry, idx) => (
        <Timeline.Item key={idx}>
            <Timeline.Point icon={HiCalendar} />
            <Timeline.Content>
                <Timeline.Time>
                    {entry.date}
                </Timeline.Time>
                <Timeline.Title>
                    {entry.title}
                </Timeline.Title>
                <div className="flex flex-row py-2 gap-2">
                    {renderTags(entry.tags)}
                </div>
                <Timeline.Body>
                    {entry.short_description}
                </Timeline.Body>
                <Link href={`/series/${series.slug}/${entry.slug}`}>
                <Button color="gray">
                    View Post
                    <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                </Button>
                </Link>
            </Timeline.Content>
        </Timeline.Item>
    ))
}

export default function SeriesMainCard(props: SeriesMainCardProps) {
    return (
        <Card>
            <p>
                {props.series.long_description}
            </p>
            <div className="flex flex-row py-2 pb-2 gap-2">
                {renderTags(props.series.tags)}
            </div>
            <hr className="my-2 h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <Timeline className="mx-5">
                {renderSeriesTimeline(props.series)}
            </Timeline>
        </Card>
    )
}