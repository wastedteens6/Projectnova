'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFiltersBar } from '@/components/projects/ProjectFiltersBar';
import { Pagination } from '@/components/projects/Pagination';
import { ProjectFilters, ProjectListResponse } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Category, CATEGORIES } from '@/types/project';

function ProjectsContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const catParam = searchParams.get('category');
    const initialCategory: Category | 'ALL' = (catParam && (CATEGORIES as string[]).includes(catParam)) 
        ? catParam as Category 
        : 'ALL';

    const [projects, setProjects] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        limit: 12,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [filters, setFilters] = useState<ProjectFilters>({
        search: q,
        category: initialCategory,
        techStack: '',
        sortBy: 'createdAt',
        order: 'desc',
        page: 1,
        limit: 12,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Sync filters with URL params on mount/change
    useEffect(() => {
        const currentQ = searchParams.get('q') || '';
        const currentCat = searchParams.get('category');
        const validatedCat: Category | 'ALL' = (currentCat && (CATEGORIES as string[]).includes(currentCat))
            ? currentCat as Category
            : 'ALL';

        setFilters(prev => ({
            ...prev,
            search: currentQ,
            category: validatedCat
        }));
    }, [searchParams]);

    // Fetch projects when filters change
    useEffect(() => {
        fetchProjects();
    }, [filters]);

    const fetchProjects = async () => {
        setLoading(true);
        setError('');

        try {
            // Build query string
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category && filters.category !== 'ALL')
                params.append('category', filters.category);
            if (filters.techStack) params.append('techStack', filters.techStack);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.order) params.append('order', filters.order);
            params.append('page', String(filters.page || 1));
            params.append('limit', String(filters.limit || 12));

            const response = await fetch(`/api/projects?${params.toString()}`);
            const data: ProjectListResponse = await response.json();

            if (data.success) {
                setProjects(data.data.projects);
                setPagination(data.data.pagination);
            } else {
                setError('Failed to fetch projects');
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('An error occurred while fetching projects');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersChange = (newFilters: ProjectFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 py-12 pt-28">
                {/* Header */}
                <div className="mb-12 text-center space-y-6">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
                            Project Catalog
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Discover premium final year projects with complete source code, documentation, and support
                        </p>
                    </div>

                    <div className="flex justify-center flex-col sm:flex-row gap-4">
                        <Link href="/projects/custom">
                            <Button variant="outline" className="h-12 px-8 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-2">
                                <Sparkles className="h-4 w-4" />
                                Request Custom Project
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8">
                    <ProjectFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />
                </div>

                {/* Results Count */}
                {!loading && (
                    <div className="mb-6 text-sm text-muted-foreground">
                        Found {pagination.totalCount} project{pagination.totalCount !== 1 ? 's' : ''}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-96 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 animate-pulse"
                            />
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-2 text-destructive">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && projects.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && !error && projects.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {projects.map((project) => (
                                <ProjectCard key={project.id} {...project} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            hasNextPage={pagination.hasNextPage}
                            hasPrevPage={pagination.hasPrevPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<div>Loading Projects...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
