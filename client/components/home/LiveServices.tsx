import { Button, Tabs, Badge } from "flowbite-react";
import { Service, SiteTag } from "../../interfaces/Data";
import { HiArrowNarrowRight } from "react-icons/hi";
import HomeCard from "./HomeCard";
import { renderTags } from "../../lib/Rendering";
import Image from "next/image";

interface LiveServicesProps {
    services: Service[];
}

const renderService = (service: Service) => {
    return (
        <>
            <img className="rounded-xl object-scale-down p-3" src={service.image} alt={service.name} />
            <hr className="my-4 h-px bg-gray-200 border-0 dark:bg-gray-700"></hr>
            <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-bold">
                        {service.name}
                    </h3>
                    <div className="flex flex-row py-2 gap-2">
                        {renderTags(service.tags)}
                    </div>
                    <p className="text-gray-500">
                        {service.description}
                    </p>
                    <Button color="gray" onClick={() => window.open("https://" + service.subdomain + ".dankservices.com", "_blank")}>
                        Open Service
                        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                    </Button>
                </div>
            </div>
        </>
    )
}

const renderServicesTabs = (services: Service[]) => {
    // Sorting by ID for now, but this will be changed to a custom sort order
    const sortedServices = services.sort((a, b) => b.id - a.id).slice(0, 3);
    return sortedServices.map((service, idx) => (
        <Tabs.Item title={service.name} key={idx}>
            {renderService(service)}
        </Tabs.Item>
    ))
}

export default function LiveServices(props: LiveServicesProps) {
    return (
        <HomeCard
            title="Live Services"
            content={
                <Tabs.Group>
                    {renderServicesTabs(props.services)}
                </Tabs.Group>
            }
        />
    )
}