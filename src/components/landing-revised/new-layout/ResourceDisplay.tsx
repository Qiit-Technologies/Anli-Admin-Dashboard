'use client';

import { ContentfulResourceEntry } from '@/types/blog';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import ResourcesFilters from './ResourceFilters';
import { useRouter } from 'next/navigation';
import { getContentfulImageUrl } from '@/lib/contentful';

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
    const router = useRouter();
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

    const filteredResourcesByType = useMemo(() => {
        const filtered: ResourcesByType = {};
        availableTypes.forEach((type) => {
            const typeResources = initialResourcesByType[type] || [];
            filtered[type] = filterResourcesBySearch(typeResources);
        });
        return filtered;
    }, [initialResourcesByType, searchQuery, availableTypes]);

    const imageUrl = (
        post: ContentfulResourceEntry,
        imageWidth = 450,
        imageHeight = 200,
    ) =>
        post.fields.image
            ? getContentfulImageUrl(post.fields.image, imageWidth, imageHeight)
            : '/images/placeholder.png';

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
                            <div key={type} className="mt-9 lg:mt-[74px]">
                                <div className="flex justify-between items-center">
                                    <p className="text-[#241102] text-[24px] font-semibold leading-[32px]">
                                        White papers & Guides
                                    </p>
                                    {/* <Button
                                        onClick={() =>
                                            router.push(
                                                `/resources/categories/${getTypeSlug(type)}`,
                                            )
                                        }
                                        variant="link"
                                        className="text-orion-blue underline underline-offset-2 text-[36px] lg:text-[18px] font-semibold leading-[32px]"
                                    >
                                        View All
                                    </Button> */}
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-6">
                                    {filteredResources.map((post) => (
                                        <div
                                            key={post.fields.title}
                                            className="col-span-2 lg:col-span-1 rounded-2xl border border-[#EAECF0]"
                                        >
                                            <img
                                                style={{
                                                    objectFit: 'cover',
                                                    objectPosition: 'center',
                                                }}
                                                src={imageUrl(post)}
                                                className="h-[280px] rounded-t-2xl w-full"
                                            />
                                            <div className="px-6 py-8 flex flex-col gap-7 justify-between items-stretch min-h-[230px]">
                                                <div>
                                                    <p className="text-[#101828] text-[24px] font-semibold leading-[32px]">
                                                        {post.fields.title}
                                                    </p>
                                                    <p className="mt-3 text-[#667085] text-[16px] font-normal leading-[24px]">
                                                        {
                                                            post.fields
                                                                .description
                                                        }
                                                    </p>
                                                </div>

                                                <span
                                                    onClick={() =>
                                                        router.push(
                                                            `/resources/${post.fields.slug}`,
                                                        )
                                                    }
                                                    className="cursor-pointer text-[#D55D00] text-[16px] font-medium leading-6 flex items-center gap-2"
                                                >
                                                    Read post
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
