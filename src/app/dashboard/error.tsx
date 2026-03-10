'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log to error reporting service in production
        console.error('[Dashboard Error]', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 p-8">
            <div className="rounded-full bg-destructive/10 border border-destructive/20 p-5">
                <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground max-w-sm">
                    An unexpected error occurred while loading this page. Please try again.
                </p>
                {error.digest && (
                    <p className="text-xs text-muted-foreground/60 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>

            <Button onClick={reset} variant="gradient" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
            </Button>
        </div>
    );
}
