'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Shield, Calendar, Save, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
    const { data: session, update } = useSession();
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState<{
        name: string;
        email: string;
        role: string;
        createdAt: string;
    } | null>(null);

    useEffect(() => {
        fetch('/api/user/profile')
            .then((r) => r.json())
            .then((d) => {
                if (d.success) {
                    setProfile(d.data);
                    setName(d.data.name);
                }
            });
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaved(false);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const data = await res.json();
            if (data.success) {
                setProfile((prev) => prev ? { ...prev, name: data.data.name } : prev);
                await update({ name: data.data.name }); // Update NextAuth session
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const ROLE_LABELS: Record<string, string> = {
        USER: 'Customer',
        ADMIN: 'Administrator',
        MODERATOR: 'Moderator',
        MANAGER: 'Manager',
        EMPLOYEE: 'Employee',
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account information</p>
            </div>

            {/* Avatar + Role */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl flex-shrink-0">
                    {(profile?.name || session?.user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="text-xl font-bold">{profile?.name || session?.user?.name}</div>
                    <div className="text-muted-foreground text-sm">{profile?.email || session?.user?.email}</div>
                    <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                        <Shield className="h-3 w-3" />
                        {ROLE_LABELS[profile?.role || 'USER'] || profile?.role}
                    </span>
                </div>
            </div>

            {/* Edit Name */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6 space-y-5">
                <h2 className="text-lg font-semibold">Personal Information</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Your full name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={profile?.email || session?.user?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-border/30 bg-muted/30 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Member Since
                    </label>
                    <div className="px-4 py-2.5 rounded-xl border border-border/30 bg-muted/30 text-sm text-muted-foreground">
                        {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })
                            : '—'}
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving || name === profile?.name || name.trim().length < 2}
                    variant="gradient"
                    className="gap-2"
                >
                    {isSaving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                    ) : saved ? (
                        <><CheckCircle className="h-4 w-4" />Saved!</>
                    ) : (
                        <><Save className="h-4 w-4" />Save Changes</>
                    )}
                </Button>
            </div>
        </div>
    );
}
