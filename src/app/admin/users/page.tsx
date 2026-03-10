import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Admin — Users' };

const ROLE_COLORS: Record<string, string> = {
    USER: 'bg-muted/50 text-muted-foreground border-border',
    ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
    MODERATOR: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    MANAGER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    EMPLOYEE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            _count: { select: { orders: true } },
        },
    });

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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">User</th>
                                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Role</th>
                                    <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Orders</th>
                                    <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Verified</th>
                                    <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/20 transition-colors">
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
                                            {formatDate(user.createdAt.toISOString())}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
