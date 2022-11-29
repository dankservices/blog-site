import { Card } from "flowbite-react"

interface HeroProps {
    title: string,
    textContent: string,
    buttonContent?: string,
    buttonOnClick?: () => void
}

export default function Hero(props: HeroProps) {
    return (
        <Card className="flex mx-16 my-2">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                {props.title}
            </h1>
            <p className="font-normal text-gray-700 dark:text-gray-400">
                {props.textContent}
            </p>
            {props.buttonContent && props.buttonOnClick && (
                <button onClick={props.buttonOnClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    {props.buttonContent}
                </button>
            )}
        </Card>
    )
}