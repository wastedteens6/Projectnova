import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/login?callbackUrl=/dashboard');
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative flex min-h-screen">
                {/* Sidebar */}
                <DashboardSidebar user={session.user} />

                {/* Main Content */}
                <main className="flex-1 ml-0 md:ml-64 pt-16 md:pt-0">
                    <div className="container mx-auto px-4 py-8 max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
