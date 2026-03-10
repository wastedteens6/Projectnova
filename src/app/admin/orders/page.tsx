import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Admin — Orders' };

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            items: { include: { project: { select: { title: true } } } },
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Orders</h1>
                <p className="text-muted-foreground mt-1">All customer orders</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-orange-400" />
                        All Orders ({orders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No orders yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Customer</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Items</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="py-3 px-2">
                                                <p className="font-medium">{order.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{order.user.email}</p>
                                            </td>
                                            <td className="py-3 px-2 hidden md:table-cell">
                                                <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                    {order.items.map((i) => i.project.title).join(', ')}
                                                </p>
                                            </td>
                                            <td className="py-3 px-2 font-bold">
                                                ₹{order.totalAmount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge className={`text-xs border ${order.status === 'PAID'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : order.status === 'REFUNDED'
                                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">
                                                {formatDate(order.createdAt.toISOString())}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
