'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 shadow-2xl shadow-red-500/10">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-lg">
            We've encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => reset()}
            className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 font-bold transition-all active:scale-[0.98] gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-border shadow-sm font-bold hover:bg-accent transition-all active:scale-[0.98] gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50 text-left overflow-auto max-h-40">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Error Details</p>
            <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
