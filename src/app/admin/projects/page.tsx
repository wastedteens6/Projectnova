'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

interface Project {
    id: string;
    title: string;
    slug: string;
    category: string;
    tier1Price: number;
    tier2Price: number;
    tier3Price: number;
    views: number;
    isPublished: boolean;
    createdAt: string;
}

export default function AdminProjectsPage() {
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/projects');
            const data = await res.json();
            if (data.success) setProjects(data.data.projects);
        } catch {
            toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleTogglePublish = async (id: string) => {
        setTogglingId(id);
        try {
            const res = await fetch(`/api/admin/projects/${id}/publish`, { method: 'PATCH' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast({ title: 'Success', description: data.message });
            setProjects((prev) =>
                prev.map((p) => p.id === id ? { ...p, isPublished: data.data.isPublished } : p)
            );
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
        } finally {
            setTogglingId(null);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast({ title: 'Deleted', description: `"${title}" has been deleted` });
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Projects</h1>
                    <p className="text-muted-foreground mt-1">Manage your project catalog</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button variant="gradient" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Project
                    </Button>
                </Link>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-400" />
                        All Projects ({projects.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No projects yet</p>
                            <Link href="/admin/projects/new">
                                <Button variant="gradient" className="mt-4 gap-2">
                                    <Plus className="h-4 w-4" /> Create First Project
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Title</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">Category</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Prices</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell">Views</th>
                                        <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                                        <th className="text-right py-3 px-2 text-muted-foreground font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {projects.map((project) => (
                                        <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="py-3 px-2">
                                                <div>
                                                    <p className="font-medium">{project.title}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{project.slug}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 hidden md:table-cell">
                                                <Badge className="text-xs bg-muted/50 text-muted-foreground border-border">
                                                    {project.category}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 hidden lg:table-cell">
                                                <div className="text-xs space-y-0.5">
                                                    <p>T1: ₹{project.tier1Price.toLocaleString('en-IN')}</p>
                                                    <p>T2: ₹{project.tier2Price.toLocaleString('en-IN')}</p>
                                                    <p>T3: ₹{project.tier3Price.toLocaleString('en-IN')}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground">
                                                {project.views.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2">
                                                <Badge className={`text-xs border ${project.isPublished
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-muted/50 text-muted-foreground border-border'
                                                    }`}>
                                                    {project.isPublished ? 'Live' : 'Draft'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() => handleTogglePublish(project.id)}
                                                        disabled={togglingId === project.id}
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                        title={project.isPublished ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {togglingId === project.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : project.isPublished ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <Link
                                                        href={`/admin/projects/${project.id}/edit`}
                                                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(project.id, project.title)}
                                                        disabled={deletingId === project.id}
                                                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                                    >
                                                        {deletingId === project.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
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
