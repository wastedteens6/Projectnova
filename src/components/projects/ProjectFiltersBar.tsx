'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, CATEGORY_LABELS, Category } from '@/types/project';
import { ProjectFilters } from '@/types/project';

interface ProjectFiltersBarProps {
    filters: ProjectFilters;
    onFiltersChange: (filters: ProjectFilters) => void;
}

export function ProjectFiltersBar({ filters, onFiltersChange }: ProjectFiltersBarProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [techOptions, setTechOptions] = useState<string[]>([]);

    // Fetch available tech stack options
    useEffect(() => {
        fetch('/api/projects/tech-stack')
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setTechOptions(data.data);
                }
            })
            .catch((err) => console.error('Failed to fetch tech options:', err));
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleSearchSubmit = () => {
        onFiltersChange({ ...filters, search, page: 1 });
    };

    const handleCategoryChange = (category: string) => {
        onFiltersChange({ ...filters, category: category as Category | 'ALL', page: 1 });
    };

    const handleTechStackChange = (tech: string) => {
        onFiltersChange({ ...filters, techStack: tech === 'all' ? '' : tech, page: 1 });
    };

    const handleSortChange = (sortBy: string) => {
        onFiltersChange({ ...filters, sortBy: sortBy as any, page: 1 });
    };

    const handleReset = () => {
        setSearch('');
        onFiltersChange({
            search: '',
            category: 'ALL',
            techStack: '',
            sortBy: 'createdAt',
            order: 'desc',
            page: 1,
        });
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                        className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
                    />
                </div>
                <Button onClick={handleSearchSubmit} className="px-6">
                    Search
                </Button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <Select
                    value={filters.category || 'ALL'}
                    onValueChange={handleCategoryChange}
                >
                    <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Tech Stack Filter */}
                <Select
                    value={filters.techStack || 'all'}
                    onValueChange={handleTechStackChange}
                >
                    <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
                        <SelectValue placeholder="Technology" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Technologies</SelectItem>
                        {techOptions.map((tech) => (
                            <SelectItem key={tech} value={tech}>
                                {tech}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort By */}
                <Select
                    value={filters.sortBy || 'createdAt'}
                    onValueChange={handleSortChange}
                >
                    <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt">Latest</SelectItem>
                        <SelectItem value="popularity">Most Popular</SelectItem>
                        <SelectItem value="price">Price: Low to High</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                        <SelectItem value="title">Name (A-Z)</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button */}
                <Button variant="outline" onClick={handleReset} className="ml-auto">
                    Reset Filters
                </Button>
            </div>

            {/* Active Filters Display */}
            {(filters.search || filters.category !== 'ALL' || filters.techStack) && (
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-muted-foreground">Active filters:</span>
                    {filters.search && (
                        <Badge variant="secondary">Search: {filters.search}</Badge>
                    )}
                    {filters.category && filters.category !== 'ALL' && (
                        <Badge variant="secondary">
                            Category: {CATEGORY_LABELS[filters.category]}
                        </Badge>
                    )}
                    {filters.techStack && (
                        <Badge variant="secondary">Tech: {filters.techStack}</Badge>
                    )}
                </div>
            )}
        </div>
    );
}

function Badge({
    children,
    variant = 'default',
}: {
    children: React.ReactNode;
    variant?: 'default' | 'secondary';
}) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${variant === 'secondary'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
        >
            {children}
        </span>
    );
}
