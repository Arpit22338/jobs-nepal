import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6 animate-in fade-in duration-500">
            <div className="relative">
                <h1 className="text-[150px] font-black text-gray-100 dark:text-gray-800 leading-none select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <i className="bx bx-ghost text-6xl text-primary animate-bounce"></i>
                </div>
            </div>

            <div className="space-y-2 relative z-10 -mt-10">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Page not found</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                </p>
            </div>

            <div className="flex gap-4 pt-4 relative z-10">
                <Link href="/">
                    <Button className="bg-primary hover:bg-primary/90 text-white px-8">
                        Go Home
                    </Button>
                </Link>
                <Button variant="outline" onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        </div>
    );
}
