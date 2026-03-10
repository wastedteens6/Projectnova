'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Loader2, UserCircle2, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserProfileCard } from '@/components/admin/user-profile-card';
import { useToast } from '@/hooks/use-toast';

const ROLE_COLORS: Record<string, string> = {
    USER: 'bg-muted/50 text-muted-foreground border-border',
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
    MODERATOR: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    EMPLOYEE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function AdminUsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.data.users);
        } catch {
            toast({ title: 'Error', description: 'Failed to load users', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold gradient-text">Users</h1>
                <p className="text-muted-foreground mt-1">All registered users</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-400" />
                        All Users ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Role</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Orders</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Verified</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Joined</th>
                                        <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="py-3 px-2">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </td>
                                        <td className="py-3 px-2">
                                            <Badge className={`text-xs border ${ROLE_COLORS[user.role] ?? ROLE_COLORS.USER}`}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">
                                            {user._count.orders}
                                        </td>
                                        <td className="py-3 px-2 hidden lg:table-cell">
                                            <Badge className={`text-xs border ${user.emailVerified
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {user.emailVerified ? 'Verified' : 'Pending'}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground text-xs">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="gap-2 h-8"
                                                onClick={() => setSelectedUserId(user.id)}
                                            >
                                                <UserCircle2 className="h-4 w-4" />
                                                <span className="hidden sm:inline">Profile</span>
                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </CardContent>
            </Card>

            {selectedUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <UserProfileCard 
                        userId={selectedUserId} 
                        onClose={() => setSelectedUserId(null)} 
                        onUpdate={fetchUsers}
                    />
                </div>
            )}
        </div>
    );
}
