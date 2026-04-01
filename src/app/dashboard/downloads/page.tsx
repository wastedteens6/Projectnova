import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Download, Package, ExternalLink } from 'lucide-react';
import { UpgradeButton } from '@/components/dashboard/UpgradeButton';

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

    // 1. Group by projectId and take the highest tier
    const projectMap = new Map<string, any>();
    
    orderItems.forEach((item) => {
        const existing = projectMap.get(item.projectId);
        if (!existing || item.tier > existing.tier) {
            projectMap.set(item.projectId, item);
        }
    });

    const uniqueProjects = Array.from(projectMap.values());

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">My Downloads</h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {uniqueProjects.length} project{uniqueProjects.length !== 1 ? 's' : ''} in your library
                    </p>
                </div>
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-gray-100 transition-all border border-gray-100 text-sm w-fit"
                >
                    Browse More
                </Link>
            </div>

            {uniqueProjects.length === 0 ? (
                <div className="rounded-[40px] border border-dashed border-gray-200 bg-white p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                        Your purchased projects and their source materials will appear here.
                    </p>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
                    >
                        Browse Marketplace
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {uniqueProjects.map((item) => {
                        const img = item.project.thumbnailUrl || item.project.images[0];
                        const tierIncludes = TIER_INCLUDES[item.tier] || TIER_INCLUDES[1];
                        
                        // Check for upgrade availability (assuming max tier is 3)
                        const nextTier = item.tier < 3 ? item.tier + 1 : null;
                        let upgradeCost = 0;
                        if (nextTier) {
                            const nextTierPrice = nextTier === 2 ? item.project.tier2Price : item.project.tier3Price;
                            upgradeCost = Math.max(0, nextTierPrice - item.price);
                        }

                        return (
                            <div
                                key={item.id}
                                className="rounded-[32px] border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
                                    {/* Left: Project Header & Info */}
                                    <div className="p-8 flex-1">
                                        <div className="flex gap-6 items-start">
                                            {/* Thumbnail */}
                                            <div className="w-24 h-24 rounded-3xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                                {img ? (
                                                    <img
                                                        src={img}
                                                        alt={item.project.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Package className="h-8 w-8" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title & Tier Badge */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <Link
                                                        href={`/projects/${item.project.slug}`}
                                                        className="font-black text-xl text-gray-900 hover:text-pink-500 transition-colors flex items-center gap-2"
                                                    >
                                                        {item.project.title}
                                                        <ExternalLink className="h-4 w-4 text-gray-300" />
                                                    </Link>
                                                    <span className="text-[10px] uppercase tracking-widest bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-black">
                                                        Tier {item.tier}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">
                                                    Purchased on {new Date(item.order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* What's included (Grid) */}
                                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {tierIncludes.map((inc) => (
                                                <div key={inc} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                                                    <div className="w-2 h-2 rounded-full bg-pink-500 shadow-sm shadow-pink-200" />
                                                    <span className="text-xs font-bold text-gray-700">{inc}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="w-full lg:w-80 p-8 bg-gray-50/30 flex flex-col gap-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Downloads & Materials</h4>
                                        
                                        <div className="space-y-3">
                                            <a
                                                href={(item.project[`tier${item.tier}Files` as keyof typeof item.project] as any)?.driveId?.startsWith('http') ?
                                                    (item.project[`tier${item.tier}Files` as keyof typeof item.project] as any)?.driveId :
                                                    `https://drive.google.com/drive/folders/${(item.project[`tier${item.tier}Files` as keyof typeof item.project] as any)?.driveId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-3 w-full h-12 bg-black text-white hover:bg-gray-800 rounded-2xl font-bold text-sm transition-all shadow-xl shadow-black/10"
                                            >
                                                <Download className="h-4 w-4" />
                                                Source Code
                                            </a>

                                            {item.tier >= 2 && (
                                                <a
                                                    href={(item.project.tier2Files as any)?.driveId?.startsWith('http') ?
                                                        (item.project.tier2Files as any)?.driveId :
                                                        `https://drive.google.com/drive/folders/${(item.project.tier2Files as any)?.driveId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-all"
                                                >
                                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                                    Video Tutorials
                                                </a>
                                            )}

                                            {item.tier >= 3 && (
                                                <a
                                                    href={(item.project.tier3Files as any)?.driveId?.startsWith('http') ?
                                                        (item.project.tier3Files as any)?.driveId :
                                                        `https://drive.google.com/drive/folders/${(item.project.tier3Files as any)?.driveId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-all"
                                                >
                                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                                    Premium Viva Q&A
                                                </a>
                                            )}
                                        </div>

                                        {/* Upgrade Option */}
                                        {nextTier && (
                                            <div className="mt-4 pt-6 border-t border-gray-100 flex flex-col gap-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Upgrade Available</span>
                                                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-lg">Save ₹{item.price}</span>
                                                </div>
                                                <UpgradeButton 
                                                    projectId={item.project.id}
                                                    projectTitle={item.project.title}
                                                    currentTier={item.tier}
                                                    targetTier={nextTier}
                                                    upgradeAmount={upgradeCost}
                                                />
                                            </div>
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
