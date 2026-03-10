export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="space-y-2">
                <div className="h-8 w-48 rounded-lg bg-muted/50" />
                <div className="h-4 w-72 rounded-md bg-muted/30" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-3"
                    >
                        <div className="h-4 w-24 rounded bg-muted/40" />
                        <div className="h-8 w-16 rounded bg-muted/50" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
                <div className="h-5 w-32 rounded bg-muted/40" />
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-muted/40 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 rounded bg-muted/40" />
                            <div className="h-3 w-1/2 rounded bg-muted/30" />
                        </div>
                        <div className="h-6 w-16 rounded-full bg-muted/30" />
                    </div>
                ))}
            </div>
        </div>
    );
}
