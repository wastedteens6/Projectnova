'use client';

import { useState, useEffect } from 'react';
import { User, Shield, ShoppingBag, Briefcase, LifeBuoy, Loader2, Check, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatDate, formatPrice } from '@/lib/utils';

const ROLES = ['USER', 'ADMIN', 'MODERATOR', 'MANAGER', 'EMPLOYEE'] as const;

interface UserStats {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
    _count: {
        orders: number;
        projectAssignments: number;
        tickets: number;
    };
    recentOrders: any[];
    tickets: any[];
}

export function UserProfileCard({ userId, onClose, onUpdate }: { userId: string, onClose: () => void, onUpdate?: () => void }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/admin/users/${userId}`);
                const data = await res.json();
                if (data.success) setStats(data.data);
                else throw new Error(data.error);
            } catch (err) {
                toast({ title: 'Error', description: 'Failed to load user diagnostics', variant: 'destructive' });
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [userId, toast, onClose]);

    const handleRoleChange = async (newRole: string) => {
        if (!stats || stats.role === newRole) return;
        
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });
            const data = await res.json();
            if (data.success) {
                setStats({ ...stats, role: data.data.role });
                toast({ title: 'Role Updated', description: `User is now a ${data.data.role}` });
                if (onUpdate) onUpdate();
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update role', variant: 'destructive' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <Card className="glass-card w-full max-w-2xl mx-auto border-primary/20">
                <CardContent className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (!stats) return null;

    return (
        <Card className="glass-card w-full max-w-3xl mx-auto border-primary/20 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="relative pb-0">
                <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors">
                    <X className="h-5 w-5" />
                </button>
                <div className="flex gap-6 items-start">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                        <User className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl font-bold">{stats.name}</CardTitle>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                {stats.role}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{stats.email}</p>
                        <p className="text-xs text-muted-foreground">Member since {formatDate(stats.createdAt)}</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <Tabs defaultValue="stats" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/30">
                        <TabsTrigger value="stats">Diagnostics</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="manage">Management</TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats" className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center space-y-1">
                                <ShoppingBag className="h-5 w-5 text-blue-400 mx-auto" />
                                <p className="text-2xl font-bold">{stats._count.orders}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Orders</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center space-y-1">
                                <Briefcase className="h-5 w-5 text-purple-400 mx-auto" />
                                <p className="text-2xl font-bold">{stats._count.projectAssignments}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Assignments</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center space-y-1">
                                <LifeBuoy className="h-5 w-5 text-orange-400 mx-auto" />
                                <p className="text-2xl font-bold">{stats._count.tickets}</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Tickets</p>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4 pt-4">
                        <div className="space-y-4">
                            {stats.recentOrders.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 text-primary" />
                                        Recent Orders
                                    </h4>
                                    <div className="space-y-2">
                                        {stats.recentOrders.map((order: any) => (
                                            <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 text-sm">
                                                <span>{order.orderNumber}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{formatPrice(order.totalAmount)}</span>
                                                    <Badge variant="outline" className="text-[10px] uppercase">{order.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent orders</p>
                            )}

                            {stats.tickets.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-border/50">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <LifeBuoy className="h-4 w-4 text-primary" />
                                        Support Tickets
                                    </h4>
                                    <div className="space-y-2">
                                        {stats.tickets.map((ticket: any) => (
                                            <div key={ticket.id} className="p-3 rounded-lg bg-muted/20 border border-border/50 text-sm space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{ticket.subject}</span>
                                                    <Badge variant="outline" className="text-[10px] uppercase">{ticket.status}</Badge>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">{ticket.ticketNumber} • {ticket.priority} priority</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="manage" className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    Account Role
                                </label>
                                <p className="text-xs text-muted-foreground">Modify user permissions. Be careful when assigning ADMIN roles.</p>
                                
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {ROLES.map((role) => (
                                        <Button
                                            key={role}
                                            variant={stats.role === role ? 'gradient' : 'outline'}
                                            size="sm"
                                            onClick={() => handleRoleChange(role)}
                                            disabled={updating || stats.role === role}
                                            className="justify-between group"
                                        >
                                            {role}
                                            {stats.role === role && <Check className="h-4 w-4" />}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex gap-3 text-xs text-orange-400">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>Note: Higher roles like MANAGER and ADMIN can access sensitive financial and system data.</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
