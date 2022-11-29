import { Badge, Button, Card } from "flowbite-react";
import { Service, SiteTag } from "../../interfaces/Data";
import { HiArrowNarrowRight } from "react-icons/hi";
import { renderTags } from "../../lib/Rendering";

interface ServiceCardProps {
    service: Service;
}

export default function ServiceCard(props: ServiceCardProps) {
    return (
        <Card className="flex mx-16 my-2" imgSrc={props.service.image}>
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {props.service.name}
            </h5>
            <div className="flex flex-row gap-2">
                {renderTags(props.service.tags)}
            </div>
            <hr className="my-2 h-px bg-gray-200 border-0 dark:bg-gray-700" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
                {props.service.description}
            </p>
            <Button color="gray" onClick={() => window.open("https://" + props.service.subdomain + ".dankservices.com", "_blank")}>
                Open Service
                <HiArrowNarrowRight className="ml-2 h-3 w-3" />
            </Button>
        </Card>
    )
}