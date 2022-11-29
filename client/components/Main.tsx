
interface MainProps {
    children: React.ReactNode;
}

export default function Main(props: MainProps) {
    return (
        <div className="flex flex-col content-center gap-4 min-h-screen w-full dark:bg-gray-900 dark:text-gray-100">
            {props.children}
        </div>
    )
}