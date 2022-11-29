import { Button, Card, TextInput } from "flowbite-react";
import { SeriesPreview } from "../../interfaces/Data";
import { renderTags } from "../../lib/Rendering";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useState } from "react";
import Link from "next/link";
interface CardProps {
    cardTitle: string,
    cardSeries: SeriesPreview[]
    search?: boolean
}

const renderSeries = (series: SeriesPreview[]) => {
    return series.map((series) => (
        <>
            <div className="grid grid-cols-2 justify-between gap-2">
                <div className="flex flex-col gap-2">
                    <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white my-2">
                        {series.title}
                    </h5>
                    <div className="flex flex-row gap-2 mb-2">
                        {renderTags(series.tags)}
                    </div>
                    <Link href={"/series/" + series.slug}>
                        <Button color="gray">
                            View Series
                            <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-md text-gray-600 dark:text-gray-400 my-2">
                        {series.short_description}
                    </p>
                </div>
            </div>
            <hr className="my-2 h-px bg-gray-200 border-0 dark:bg-gray-700" />
        </>
    ))
}

export default function IndexCard(props: CardProps) {
    const [searchString, setSearchString] = useState<string>("");
    return (
        <Card>
            <div className="flex flex-row justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white my-2">
                    {props.cardTitle}
                </h2>
                {props.search ? <TextInput id="search" type="text" placeholder="Search for a series..." /> : null}
            </div>
            <hr className="my-2 h-px bg-gray-200 border-0 dark:bg-gray-700" />
            {renderSeries(props.cardSeries)}
        </Card>
    )
}