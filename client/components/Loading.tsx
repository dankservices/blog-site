import { Spinner } from "flowbite-react";


export default function Loading() {
    return (
        <div className="fixed z-50 inset-0 bg-slate-500/50">
            <div className="relative flex min-h-screen items-center justify-center">
                <Spinner
                    aria-label="Loading..."
                    className="flex justify-center items-center"
                    size="xl"
                />
            </div>
        </div>
    )
}