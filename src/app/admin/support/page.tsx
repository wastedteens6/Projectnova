import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LifeBuoy, ChevronRight, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Admin — Support' };

const STATUS_COLORS: Record<string, string> = {
    OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    CLOSED: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'bg-muted/50 text-muted-foreground border-border',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    URGENT: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default async function AdminSupportPage() {
    const tickets = await prisma.supportTicket.findMany({
        take: 100,
        orderBy: { updatedAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } },
            _count: { select: { responses: true } },
        },
    });

    const stats = {
        open: tickets.filter((t) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        closed: tickets.filter((t) => t.status === 'CLOSED').length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Support Tickets</h1>
                <p className="text-muted-foreground mt-1">Manage all customer support tickets</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Open', value: stats.open, color: 'text-blue-400' },
                    { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-400' },
                    { label: 'Closed', value: stats.closed, color: 'text-green-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-2xl border border-border/50 bg-card/50 p-4 text-center">
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                ))}
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LifeBuoy className="h-5 w-5 text-orange-400" />
                        All Tickets ({tickets.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {tickets.length === 0 ? (
                        <div className="text-center py-12">
                            <LifeBuoy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No support tickets yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {tickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/admin/support/${ticket.id}`}
                                    className="flex items-center gap-4 py-4 hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="text-xs font-mono text-muted-foreground">
                                                #{ticket.ticketNumber.slice(-8)}
                                            </span>
                                            <Badge className={`text-xs border ${STATUS_COLORS[ticket.status]}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                            <Badge className={`text-xs border ${PRIORITY_COLORS[ticket.priority]}`}>
                                                {ticket.priority}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {ticket.user.name} · {formatDate(ticket.updatedAt.toISOString())}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {ticket._count.responses > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                {ticket._count.responses}
                                            </div>
                                        )}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
