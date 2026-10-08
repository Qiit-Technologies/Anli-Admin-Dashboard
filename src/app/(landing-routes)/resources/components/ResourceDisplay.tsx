'use client';

import ContentfulArticleCard from '@/components/landing-revised/cards/ContentfulArticlecard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ContentfulResourceEntry } from '@/types/blog';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import ResourcesFilters from './ResourceFilters';

const ResourceCategoryList = ({
    title,
    children,
    className,
    viewAllLink,
}: {
    className?: string;
    title: string;
    children: ReactNode;
    viewAllLink?: string;
}) => {
    return (
        <div className={className}>
            <div className="flex justify-between items-center">
                <h1 className="text-orion-blue">{title}</h1>
                <Link href={viewAllLink || '/resources'}>
                    <Button
                        variant="link"
                        className="text-orion-blue underline underline-offset-2"
                    >
                        View All
                    </Button>
                </Link>
            </div>
            <ScrollArea className="w-full">
                <div className="flex w-max space-x-6 py-4">{children}</div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};

interface ResourcesByType {
    [key: string]: ContentfulResourceEntry[];
}
interface ResourcesDisplayProps {
    initialResourcesByType: ResourcesByType;
    availableTypes: string[];
    availableTags: string[];
    onFiltersChange: (
        searchQuery: string,
        sortOption: string,
        tags: string[],
    ) => void;
}

export default function ResourcesDisplay({
    initialResourcesByType,
    availableTypes,
    availableTags,
    onFiltersChange,
}: ResourcesDisplayProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('newest');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        onFiltersChange(query, sortOption, selectedTags);
    };

    const handleSortChange = (sort: string) => {
        setSortOption(sort);
        setLoading(true);
        onFiltersChange(searchQuery, sort, selectedTags);
        setTimeout(() => setLoading(false), 500);
    };

    const handleTagsChange = (tags: string[]) => {
        setSelectedTags(tags);
        onFiltersChange(searchQuery, sortOption, tags);
    };

    const filterResourcesBySearch = (resources: ContentfulResourceEntry[]) => {
        let filtered = resources;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.fields.title.toLowerCase().includes(query) ||
                    (post.fields.description &&
                        post.fields.description
                            .toLowerCase()
                            .includes(query)) ||
                    (post.fields.tags &&
                        post.fields.tags
                            .split(',')
                            .map((tag) => tag.trim().toLowerCase())
                            .some((tag) => tag.includes(query))),
            );
        }

        if (selectedTags.length > 0) {
            filtered = filtered.filter((post) => {
                if (!post.fields.tags) return false;
                const postTags = post.fields.tags
                    .split(',')
                    .map((tag) => tag.trim());
                return selectedTags.every((selectedTag) =>
                    postTags.includes(selectedTag),
                );
            });
        }

        return filtered;
    };

    const getTypeSlug = (type: string) => {
        return type
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    };

    const filteredResourcesByType = useMemo(() => {
        const filtered: ResourcesByType = {};
        availableTypes.forEach((type) => {
            const typeResources = initialResourcesByType[type] || [];
            filtered[type] = filterResourcesBySearch(typeResources);
        });
        return filtered;
    }, [initialResourcesByType, searchQuery, availableTypes]);

    return (
        <>
            <ResourcesFilters
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onTagsChange={handleTagsChange}
                availableTags={availableTags}
            />

            {loading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading resources...</span>
                </div>
            ) : (
                <>
                    {availableTypes.map((type) => {
                        const filteredResources =
                            filteredResourcesByType[type] || [];

                        if (filteredResources.length === 0 && !searchQuery)
                            return null;

                        return (
                            <ResourceCategoryList
                                key={type}
                                className="mt-10"
                                title={type}
                                viewAllLink={`/resources/categories/${getTypeSlug(type)}`}
                            >
                                {filteredResources.map((post) => (
                                    <ContentfulArticleCard
                                        key={post.fields.slug}
                                        post={post}
                                        showTags={true}
                                        showReadTime={true}
                                        maxTags={3}
                                        baseUrl={
                                            process.env.NEXT_PUBLIC_SITE_URL ||
                                            'https://weareanli.com/'
                                        }
                                    />
                                ))}
                            </ResourceCategoryList>
                        );
                    })}

                    {searchQuery &&
                        availableTypes.every(
                            (type) =>
                                (filteredResourcesByType[type] || []).length ===
                                0,
                        ) && (
                            <div className="w-full text-center py-10">
                                <p>
                                    No resources found matching &ldquo;
                                    {searchQuery}&rdquo;
                                </p>
                            </div>
                        )}
                </>
            )}
        </>
    );
}
