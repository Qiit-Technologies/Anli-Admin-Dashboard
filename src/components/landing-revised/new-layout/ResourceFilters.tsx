'use client';

import SearchInput from '@/components/common/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCw, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ResourceFiltersProps {
    onSearchChange: (query: string) => void;
    onSortChange: (sort: string) => void;
    onTagsChange?: (tags: string[]) => void;
    availableTags?: string[];
}

export default function ResourceFilters({
    onSearchChange,
    onSortChange,
    onTagsChange,
    availableTags = [],
}: ResourceFiltersProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearchChange(value);
    };

    const handleSortChange = (value: string) => {
        setSortOption(value);
        onSortChange(value);
    };

    const handleTagSelect = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            const newTags = [...selectedTags, tag];
            setSelectedTags(newTags);
            onTagsChange?.(newTags);
        }
    };

    const handleTagRemove = (tagToRemove: string) => {
        const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
        setSelectedTags(newTags);
        onTagsChange?.(newTags);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedTags([]);
        setSortOption('newest');
        onSearchChange('');
        onSortChange('newest');
        onTagsChange?.([]);
    };

    const handleRefreshCache = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch('/api/revalidate-cache', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    secret:
                        process.env.NEXT_PUBLIC_REVALIDATE_SECRET ||
                        'dev-secret',
                }),
            });

            if (response.ok) {
                toast.success('Content refreshed successfully!');
                window.location.reload();
            } else {
                toast.error('Failed to refresh content');
            }
        } catch (error: any) {
            toast.error('Error refreshing content');
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex-1">
                    <SearchInput
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full max-w-lg"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Select value={sortOption} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="title">Title A-Z</SelectItem>
                            <SelectItem value="readTime">Read Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={handleTagSelect}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTags.map((tag) => (
                                <SelectItem key={tag} value={tag}>
                                    {tag}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {process.env.NODE_ENV !== 'production' && (
                        <Button
                            onClick={handleRefreshCache}
                            disabled={isRefreshing}
                            variant="outline"
                        >
                            {isRefreshing ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Refresh
                        </Button>
                    )}
                </div>
            </div>

            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">
                        Filtered by:
                    </span>
                    {selectedTags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-[7px]"
                        >
                            {tag}
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleTagRemove(tag)}
                            />
                        </Badge>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                    >
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
