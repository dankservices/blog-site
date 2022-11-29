import { Service, SiteTag } from "../interfaces/Data"
import { Badge } from "flowbite-react"
import ServiceCard from "../components/services/ServiceCard"

export const renderTags = (tags: SiteTag[]) => {
    return tags.map((tag, idx) => (
        <Badge color= { tag.color } key={idx} >
        { tag.name }
        </Badge>
    ))
}
