import { Card } from "flowbite-react";
import { Post } from "../../interfaces/Data";
import { renderTags } from "../../lib/Rendering";


interface SeriesPostCardProps {
    post: Post;
}

export default function SeriesPostCard(props: SeriesPostCardProps) {
    return (
        <>
        <h1 className="my-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {props.post.title}
        </h1>
        <Card>
            <div className="flex flex-col gap-4">
                <h5 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                    {props.post.short_description}
                </h5>
                <div className="flex flex-row gap-2">
                    {renderTags(props.post.tags)}
                </div>
                <hr className="my-2 h-px bg-gray-200 border-0 dark:bg-gray-700" />
                <div dangerouslySetInnerHTML={{ __html: props.post.content }} />
            </div>
        </Card>
        </>
    )
}