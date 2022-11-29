import { Card } from "flowbite-react"

interface HomeCardProps {
    title: string,
    content: React.ReactNode
}

export default function HomeCard(props: HomeCardProps) {
    return (
    <Card className="flex-auto gap-4 my-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white my-2">
            {props.title}
        </h2>
        <div className="h-full">
        {props.content}
            </div>
    </Card>
    )
}