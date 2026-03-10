import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ShoppingBag, Download } from 'lucide-react';

export const metadata = { title: 'My Orders | Dashboard' };

const STATUS_STYLES: Record<string, string> = {
    PAID: 'bg-green-500/10 text-green-500',
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    FAILED: 'bg-red-500/10 text-red-500',
    REFUNDED: 'bg-blue-500/10 text-blue-500',
};

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    const orders = await prisma.order.findMany({
        where: { userId: session!.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    project: {
                        select: { id: true, title: true, slug: true, thumbnailUrl: true, images: true },
                    },
                },
            },
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Orders</h1>
                <p className="text-muted-foreground mt-1">
                    {orders.length} order{orders.length !== 1 ? 's' : ''} total
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-16 text-center">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Browse our catalog and purchase your first project!
                    </p>
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Browse Projects
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden"
                        >
                            {/* Order Header */}
                            <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-border/30 bg-muted/20">
                                <div className="space-y-0.5">
                                    <div className="text-xs text-muted-foreground">Order ID</div>
                                    <div className="font-mono text-sm font-medium">
                                        {order.orderNumber.slice(0, 16)}...
                                    </div>
                                </div>
                                <div className="space-y-0.5 text-right sm:text-left">
                                    <div className="text-xs text-muted-foreground">Date</div>
                                    <div className="text-sm">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-xs text-muted-foreground">Total</div>
                                    <div className="font-bold">₹{order.totalAmount.toLocaleString()}</div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            {/* Order Items */}
                            <div className="divide-y divide-border/30">
                                {order.items.map((item) => {
                                    const img = item.project.thumbnailUrl || item.project.images[0];
                                    return (
                                        <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                                            {/* Thumbnail */}
                                            <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
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
                                                    className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1"
                                                >
                                                    {item.project.title}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                        Tier {item.tier}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ₹{item.price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Download Link */}
                                            {order.status === 'PAID' && (
                                                <Link
                                                    href="/dashboard/downloads"
                                                    className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Download
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
