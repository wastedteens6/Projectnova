import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin Panel — ProjectNova' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/login?callbackUrl=/admin');
    }

    const role = session.user.role as string;
    if (role !== 'ADMIN' && role !== 'MODERATOR') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-500/8 rounded-full blur-3xl" />
            </div>

            <div className="relative flex min-h-screen">
                <AdminSidebar user={session.user} />
                <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0">
                    <div className="container mx-auto px-4 py-8 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
