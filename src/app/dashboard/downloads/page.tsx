import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Download, Package, ExternalLink } from 'lucide-react';

export const metadata = { title: 'Downloads | Dashboard' };

const TIER_NAMES: Record<number, string> = {
    1: 'Code Only',
    2: 'Code + Videos',
    3: 'Premium Support',
};

const TIER_INCLUDES: Record<number, string[]> = {
    1: ['Source Code (.zip)', 'README Documentation'],
    2: ['Source Code (.zip)', 'README Documentation', 'Tutorial Videos'],
    3: ['Source Code (.zip)', 'README Documentation', 'Tutorial Videos', 'Viva Q&A PDF', 'Priority Support (45 days)'],
};

export default async function DownloadsPage() {
    const session = await getServerSession(authOptions);

    // Get all paid order items
    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: {
                userId: session!.user.id,
                status: 'PAID',
            },
        },
        include: {
            project: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    category: true,
                    techStack: true,
                    thumbnailUrl: true,
                    images: true,
                    tier1Files: true,
                    tier2Files: true,
                    tier3Files: true,
                },
            },
            order: {
                select: { createdAt: true, orderNumber: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Downloads</h1>
                <p className="text-muted-foreground mt-1">
                    {orderItems.length} project{orderItems.length !== 1 ? 's' : ''} available to download
                </p>
            </div>

            {orderItems.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Purchase a project to access its files here.
                    </p>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Browse Projects
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orderItems.map((item) => {
                        const img = item.project.thumbnailUrl || item.project.images[0];
                        const tierIncludes = TIER_INCLUDES[item.tier] || TIER_INCLUDES[1];

                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
                            >
                                <div className="flex flex-col sm:flex-row gap-0">
                                    {/* Left: Project Info */}
                                    <div className="flex gap-4 p-6 flex-1">
                                        {/* Thumbnail */}
                                        <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
                                            {img ? (
                                                <img
                                                    src={img}
                                                    alt={item.project.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                                    IMG
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/projects/${item.project.slug}`}
                                                className="font-bold text-lg hover:text-primary transition-colors line-clamp-1 flex items-center gap-1.5"
                                            >
                                                {item.project.title}
                                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                            </Link>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                    Tier {item.tier} — {TIER_NAMES[item.tier]}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Purchased {new Date(item.order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* What's included */}
                                            <div className="mt-3 space-y-1">
                                                {tierIncludes.map((inc) => (
                                                    <div key={inc} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                        {inc}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Download Actions */}
                                    <div className="flex flex-row sm:flex-col gap-2 p-6 sm:border-l border-t sm:border-t-0 border-border/30 bg-muted/20 justify-center">
                                        <a
                                            href={(item.project[`tier${item.tier}Files` as keyof typeof item.project] as any)?.driveId?.startsWith('http') ?
                                                (item.project[`tier${item.tier}Files` as keyof typeof item.project] as any)?.driveId :
                                                `https://drive.google.com/drive/folders/${(item.project[`tier${item.tier}Files` as keyof typeof item.project] as any)?.driveId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors w-full"
                                            title="Access source code on Google Drive"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Source Code
                                        </a>
                                        {item.tier >= 2 && (
                                            <a
                                                href={(item.project.tier2Files as any)?.driveId?.startsWith('http') ?
                                                    (item.project.tier2Files as any)?.driveId :
                                                    `https://drive.google.com/drive/folders/${(item.project.tier2Files as any)?.driveId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted transition-colors w-full"
                                                title="Access videos on Google Drive"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Videos
                                            </a>
                                        )}
                                        {item.tier >= 3 && (
                                            <a
                                                href={(item.project.tier3Files as any)?.driveId?.startsWith('http') ?
                                                    (item.project.tier3Files as any)?.driveId :
                                                    `https://drive.google.com/drive/folders/${(item.project.tier3Files as any)?.driveId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted transition-colors w-full"
                                                title="Access premium resources on Google Drive"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Viva PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Note about Google Drive */}
            {orderItems.length > 0 && (
                <div className="rounded-xl border border-border/30 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
                    💡 <strong>Note:</strong> Your access to project files is managed via **Google Drive**. Ensure you use the same email address as your account to access the shared folders.
                </div>
            )}
        </div>
    );
}
