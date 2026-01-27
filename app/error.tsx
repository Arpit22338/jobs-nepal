"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <i className="bx bx-error-circle text-4xl text-red-500"></i>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Something went wrong!</h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    We apologize for the inconvenience. A technical error occurred.
                </p>
                {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-w-2xl mx-auto border border-border">
                        <p className="font-mono text-xs text-red-500">{error.message}</p>
                        {error.digest && <p className="font-mono text-xs text-muted-foreground mt-1">Digest: {error.digest}</p>}
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
                <Button onClick={() => reset()} className="bg-primary hover:bg-primary/90 text-white">
                    Try Again
                </Button>
            </div>
        </div>
    );
}
