'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Send,
    Loader2,
    Clock,
    AlertCircle,
    CheckCircle2,
    User,
    Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import Link from 'next/link';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface TicketResponse {
    id: string;
    message: string;
    isAdmin: boolean;
    adminName: string | null;
    createdAt: string;
}

interface Ticket {
    id: string;
    ticketNumber: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: Priority;
    createdAt: string;
    updatedAt: string;
    responses: TicketResponse[];
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

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const { toast } = useToast();
    const bottomRef = useRef<HTMLDivElement>(null);


    const fetchTicket = useCallback(async () => {
        try {
            const res = await fetch(`/api/support/tickets/${id}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            setTicket(data.data);
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to load ticket', variant: 'destructive' });

            router.push('/dashboard/support');
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    // Scroll to bottom when responses load
    useEffect(() => {
        if (ticket?.responses.length) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticket?.responses.length]);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/support/tickets/${id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setMessage('');
            await fetchTicket(); // Refresh to show new response + updated status
            toast({ title: 'Success', description: 'Reply sent' });

        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to send reply', variant: 'destructive' });

        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!ticket) return null;

    const status = STATUS_CONFIG[ticket.status];
    const priority = PRIORITY_CONFIG[ticket.priority];
    const StatusIcon = status.icon;
    const isClosed = ticket.status === 'CLOSED';

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Back */}
            <Link
                href="/dashboard/support"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Support
            </Link>

            {/* Ticket Header */}
            <Card className="glass-card">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono text-muted-foreground">
                                    #{ticket.ticketNumber.slice(-8)}
                                </span>
                                <Badge className={`text-xs border ${status.color}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                </Badge>
                                <Badge className={`text-xs border ${priority.color}`}>
                                    {priority.label}
                                </Badge>
                            </div>
                            <h1 className="text-xl font-bold">{ticket.subject}</h1>
                            <p className="text-xs text-muted-foreground">
                                Opened {formatDate(ticket.createdAt)}
                            </p>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Conversation Thread */}
            <div className="space-y-4">
                {/* Original message */}
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <Card className="glass-card flex-1">
                        <CardContent className="pt-4 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">You</span>
                                <span className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Responses */}
                {ticket.responses.map((response) => (
                    <div
                        key={response.id}
                        className={`flex gap-3 ${response.isAdmin ? '' : 'flex-row-reverse'}`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${response.isAdmin ? 'bg-purple-500/20' : 'bg-primary/20'
                                }`}
                        >
                            {response.isAdmin ? (
                                <Shield className="h-4 w-4 text-purple-400" />
                            ) : (
                                <User className="h-4 w-4 text-primary" />
                            )}
                        </div>
                        <Card
                            className={`flex-1 ${response.isAdmin
                                ? 'glass-card border-purple-500/20'
                                : 'glass-card border-primary/20'
                                }`}
                        >
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        {response.isAdmin ? response.adminName || 'Support Team' : 'You'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDate(response.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {response.message}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ))}

                <div ref={bottomRef} />
            </div>

            {/* Reply Form */}
            {isClosed ? (
                <Card className="glass-card border-border/30">
                    <CardContent className="pt-6 text-center py-8">
                        <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">This ticket is closed.</p>
                        <Link href="/dashboard/support">
                            <Button variant="ghost" className="mt-3 gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Open a New Ticket
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <Card className="glass-card border-primary/20">
                    <CardContent className="pt-6">
                        <form onSubmit={handleReply} className="space-y-4">
                            <textarea
                                placeholder="Write your reply..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                required
                                minLength={5}
                                className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="gradient"
                                    disabled={sending || !message.trim()}
                                    className="gap-2"
                                >
                                    {sending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Send Reply
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
