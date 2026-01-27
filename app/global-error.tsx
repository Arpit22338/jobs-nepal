"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-6 bg-white">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight text-black">Critical System Error</h2>
                        <p className="text-gray-500">
                            The application encountered a critical error and cannot render.
                        </p>
                    </div>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
