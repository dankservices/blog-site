import { PostPreview, SiteTag } from "../../interfaces/Data";
import { HiCalendar, HiArrowNarrowRight } from "react-icons/hi";
import { Badge, Button, Timeline } from "flowbite-react";
import HomeCard from "./HomeCard";
import { renderTags } from "../../lib/Rendering";

interface BlogTimelineProps {
    posts: PostPreview[];
}

const renderTimelinePosts = (posts: PostPreview[]) => {
    const sortedPosts = posts.sort((a, b) => b.id - a.id).slice(0, 3);
    return sortedPosts.map((post, idx) => (
        <Timeline.Item key={idx}>
            <Timeline.Point icon={HiCalendar} />
            <Timeline.Content>
                <Timeline.Time>
                    {post.date}
                </Timeline.Time>
                <Timeline.Title>
                    {post.title}
                </Timeline.Title>
                <div className="flex flex-row py-2 gap-2">
                    {renderTags(post.tags)}
                </div>
                <Timeline.Body>
                    {post.short_description}
                </Timeline.Body>
                <Button color="gray">
                    View Post
                    <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                </Button>
            </Timeline.Content>
        </Timeline.Item>
    ))
}

export default function BlogTimeline(props: BlogTimelineProps) {
    return (
        <HomeCard
            title="Recent Blog Posts"
            content={
                <Timeline className="mx-5">
                    {renderTimelinePosts(props.posts)}
                </Timeline>
            }
        />
    )
}