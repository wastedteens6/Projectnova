'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LifeBuoy,
    Plus,
    X,
    ChevronRight,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Ticket {
    id: string;
    ticketNumber: string;
    subject: string;
    status: TicketStatus;
    priority: Priority;
    createdAt: string;
    updatedAt: string;
    _count: { responses: number };
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: React.ElementType }> = {
    OPEN: { label: 'Open', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: AlertCircle },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
    CLOSED: { label: 'Closed', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
    LOW: { label: 'Low', color: 'bg-muted/50 text-muted-foreground border-border' },
    MEDIUM: { label: 'Medium', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    HIGH: { label: 'High', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    URGENT: { label: 'Urgent', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function SupportPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        subject: '',
        description: '',
        priority: 'MEDIUM' as Priority,
    });

    const fetchTickets = useCallback(async () => {
        try {
            const res = await fetch('/api/support/tickets');
            const data = await res.json();
            if (data.success) setTickets(data.data);
        } catch {
            toast({ title: 'Error', description: 'Failed to load tickets', variant: 'destructive' });

        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            toast({ title: 'Success', description: 'Ticket created successfully!' });

            setShowForm(false);
            setForm({ subject: '', description: '', priority: 'MEDIUM' });
            router.push(`/dashboard/support/${data.data.id}`);
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to create ticket', variant: 'destructive' });

        } finally {
            setSubmitting(false);
        }
    };

    const stats = {
        open: tickets.filter((t) => t.status === 'OPEN').length,
        inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
        closed: tickets.filter((t) => t.status === 'CLOSED').length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Support</h1>
                    <p className="text-muted-foreground mt-1">Get help with your purchases and projects</p>
                </div>
                <Button
                    variant="gradient"
                    onClick={() => setShowForm(true)}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Ticket
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Open', value: stats.open, icon: AlertCircle, color: 'text-blue-400' },
                    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-400' },
                    { label: 'Closed', value: stats.closed, icon: CheckCircle2, color: 'text-green-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="glass-card">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="rounded-xl bg-muted/50 p-3">
                                <Icon className={`h-5 w-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{value}</p>
                                <p className="text-sm text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* New Ticket Form */}
            {showForm && (
                <Card className="glass-card border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-lg">Create New Ticket</CardTitle>
                        <button
                            onClick={() => setShowForm(false)}
                            className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subject</label>
                                <Input
                                    placeholder="Brief description of your issue"
                                    value={form.subject}
                                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                    required
                                    minLength={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <div className="flex gap-2 flex-wrap">
                                    {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as Priority[]).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm((f) => ({ ...f, priority: p }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${form.priority === p
                                                ? PRIORITY_CONFIG[p].color + ' ring-1 ring-current'
                                                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted'
                                                }`}
                                        >
                                            {PRIORITY_CONFIG[p].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    placeholder="Describe your issue in detail (minimum 20 characters)"
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    required
                                    minLength={20}
                                    rows={5}
                                    className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="gradient" disabled={submitting} className="gap-2">
                                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Submit Ticket
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Ticket List */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LifeBuoy className="h-5 w-5 text-primary" />
                        Your Tickets
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <LifeBuoy className="h-8 w-8 text-primary/60" />
                            </div>
                            <p className="font-medium">No support tickets yet</p>
                            <p className="text-sm text-muted-foreground">
                                Need help? Create a ticket and our team will get back to you.
                            </p>
                            <Button variant="gradient" onClick={() => setShowForm(true)} className="gap-2 mt-2">
                                <Plus className="h-4 w-4" />
                                Create Your First Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {tickets.map((ticket) => {
                                const status = STATUS_CONFIG[ticket.status];
                                const priority = PRIORITY_CONFIG[ticket.priority];
                                const StatusIcon = status.icon;

                                return (
                                    <Link
                                        key={ticket.id}
                                        href={`/dashboard/support/${ticket.id}`}
                                        className="flex items-center gap-4 py-4 hover:bg-muted/30 -mx-2 px-2 rounded-xl transition-colors group"
                                    >
                                        <div className={`rounded-xl p-2.5 border ${status.color}`}>
                                            <StatusIcon className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    #{ticket.ticketNumber.slice(-8)}
                                                </span>
                                                <Badge className={`text-xs border ${priority.color}`}>
                                                    {priority.label}
                                                </Badge>
                                            </div>
                                            <p className="font-medium text-sm truncate">{ticket.subject}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Updated {formatDate(ticket.updatedAt)}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            {ticket._count.responses > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                    {ticket._count.responses}
                                                </div>
                                            )}
                                            <Badge className={`text-xs border ${status.color}`}>{status.label}</Badge>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
