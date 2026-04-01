'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, X, Upload, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types/project';

function TagInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
    const [input, setInput] = useState('');
    const add = () => {
        const trimmed = input.trim();
        if (trimmed && !value.includes(trimmed)) { onChange([...value, trimmed]); setInput(''); }
    };
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder="Type and press Enter" />
                <Button type="button" variant="ghost" onClick={add} className="px-3"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2">
                {value.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/50 text-xs border border-border">
                        {tag}<button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}><X className="h-3 w-3" /></button>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '', description: '', category: 'WEB' as Category,
        techStack: [] as string[], features: [] as string[],
        tier1Price: '', tier1Features: [] as string[], tier1DriveId: '',
        tier2Price: '', tier2Features: [] as string[], tier2DriveId: '',
        tier3Price: '', tier3Features: [] as string[], tier3DriveId: '',
        isPublished: false,
        images: [] as string[],
        videoUrl: '',
    });

    const fetchProject = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/projects/${id}`);
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            const p = data.data;
            setForm({
                title: p.title, description: p.description, category: p.category,
                techStack: p.techStack, features: p.features,
                tier1Price: String(p.tier1Price), tier1Features: p.tier1Features,
                tier1DriveId: (p.tier1Files as any)?.driveId || '',
                tier2Price: String(p.tier2Price), tier2Features: p.tier2Features,
                tier2DriveId: (p.tier2Files as any)?.driveId || '',
                tier3Price: String(p.tier3Price), tier3Features: p.tier3Features,
                tier3DriveId: (p.tier3Files as any)?.driveId || '',
                isPublished: p.isPublished,
                images: p.images || [],
                videoUrl: p.videoUrl || '',
            });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to load', variant: 'destructive' });
            router.push('/admin/projects');
        } finally {
            setLoading(false);
        }
    }, [id, router, toast]);

    useEffect(() => { fetchProject(); }, [fetchProject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                tier1Price: parseFloat(form.tier1Price),
                tier2Price: parseFloat(form.tier2Price),
                tier3Price: parseFloat(form.tier3Price),
                tier1Files: { driveId: form.tier1DriveId, type: 'folder' },
                tier2Files: { driveId: form.tier2DriveId, type: 'folder' },
                tier3Files: { driveId: form.tier3DriveId, type: 'folder' },
            };
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            toast({ title: 'Project updated!' });
            router.push('/admin/projects');
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const limit = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > limit) {
            toast({ title: 'Error', description: `File too large. Max ${type === 'image' ? '5MB' : '50MB'}`, variant: 'destructive' });
            return;
        }

        if (type === 'image' && form.images.length >= 10) {
            toast({ title: 'Error', description: 'Maximum 10 images allowed', variant: 'destructive' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            if (type === 'image') {
                set('images', [...form.images, data.data.url]);
            } else {
                set('videoUrl', data.data.url);
            }
            toast({ title: 'Uploaded!' });
        } catch (err) {
            toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Error', variant: 'destructive' });
        }
    };

    const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
    );

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-4">
                <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back
                </Link>
                <h1 className="text-2xl font-bold">Edit Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="glass-card">
                    <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title *</label>
                            <Input value={form.title} onChange={(e) => set('title', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category *</label>
                            <select value={form.category} onChange={(e) => set('category', e.target.value)}
                                className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description *</label>
                            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} required minLength={20}
                                className="w-full rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                        </div>
                        <TagInput label="Tech Stack" value={form.techStack} onChange={(v) => set('techStack', v)} />
                        <TagInput label="Features" value={form.features} onChange={(v) => set('features', v)} />
                    </CardContent>
                </Card>

                {([1, 2, 3] as const).map((tier) => (
                    <Card key={tier} className="glass-card">
                        <CardHeader><CardTitle>Tier {tier} — {tier === 1 ? 'Code Only' : tier === 2 ? 'Code + Videos' : 'Premium Support'}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (₹) *</label>
                                <Input type="number" min="1" step="1" value={form[`tier${tier}Price`]} onChange={(e) => set(`tier${tier}Price`, e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Google Drive Link *</label>
                                <Input
                                    value={form[`tier${tier}DriveId`]}
                                    onChange={(e) => set(`tier${tier}DriveId`, e.target.value)}
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    required
                                />
                                <p className="text-xs text-muted-foreground">The shareable link of the folder/file that will be shared with customers.</p>
                            </div>
                            <TagInput label="Features included" value={form[`tier${tier}Features`]} onChange={(v) => set(`tier${tier}Features`, v)} />
                        </CardContent>
                    </Card>
                ))}

                {/* Project Media */}
                <Card className="glass-card">
                    <CardHeader><CardTitle>Project Media</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {/* Images */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Project Images (Max 10)</label>
                                <p className="text-xs text-muted-foreground">{form.images.length}/10 uploaded</p>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {form.images.map((url, i) => (
                                    <div key={url} className="relative aspect-video rounded-xl overflow-hidden border border-border group">
                                        <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => set('images', form.images.filter(img => img !== url))}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {form.images.length < 10 && (
                                    <label className="aspect-video flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'image')}
                                        />
                                        <Upload className="h-5 w-5 text-muted-foreground mb-2" />
                                        <span className="text-xs text-muted-foreground font-medium">Add Image</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Video */}
                        <div className="space-y-4 pt-4 border-t border-border/50">
                            <label className="text-sm font-medium">Project Preview Video</label>
                            {form.videoUrl ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black/20">
                                    <video src={form.videoUrl} className="w-full h-full" controls />
                                    <button
                                        type="button"
                                        onClick={() => set('videoUrl', '')}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-destructive text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="aspect-video flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="video/*"
                                        onChange={(e) => handleFileUpload(e, 'video')}
                                    />
                                    <Play className="h-8 w-8 text-muted-foreground mb-3" />
                                    <span className="font-medium text-sm">Upload Demo Video</span>
                                    <span className="text-xs text-muted-foreground mt-1">Max 50MB (MP4, WebM)</span>
                                </label>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardContent className="pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                            <div>
                                <p className="font-medium text-sm">Published</p>
                                <p className="text-xs text-muted-foreground">Visible to customers on the catalog</p>
                            </div>
                        </label>
                    </CardContent>
                </Card>

                <div className="flex gap-3 justify-end">
                    <Link href="/admin/projects"><Button type="button" variant="ghost">Cancel</Button></Link>
                    <Button type="submit" variant="gradient" disabled={submitting} className="gap-2">
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
