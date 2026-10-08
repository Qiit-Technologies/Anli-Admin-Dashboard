'use client';

import ContentfulArticleCard from '@/components/landing-revised/cards/ContentfulArticlecard';
import { Button } from '@/components/ui/button';
import { ContentfulResourceEntry } from '@/types/blog';
import Link from 'next/link';
import { useState } from 'react';

interface TypePageContentProps {
    initialPosts: ContentfulResourceEntry[];
    totalPosts: number;
    typeName: string;
    itemsPerPage: number;
    onPageChange: (page: number) => Promise<ContentfulResourceEntry[]>;
}

export default function TypePageContent({
    initialPosts,
    totalPosts,
    typeName,
    itemsPerPage,
    onPageChange,
}: TypePageContentProps) {
    const [posts, setPosts] = useState<ContentfulResourceEntry[]>(initialPosts);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const totalPages = Math.ceil(totalPosts / itemsPerPage);

    const handlePageChange = async (newPage: number) => {
        if (newPage === currentPage || loading) return;

        setLoading(true);
        try {
            const newPosts = await onPageChange(newPage);
            setPosts(newPosts);
            setCurrentPage(newPage);
        } catch (error: any) {
            console.error('Error loading page:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Link
                    href="/resources"
                    className="text-blue-600 hover:underline mb-4 inline-block"
                >
                    ← Back to Resources
                </Link>
                <h1 className="text-3xl font-bold">{typeName}</h1>
                <p className="text-gray-600 mt-2">
                    {totalPosts} {totalPosts === 1 ? 'post' : 'posts'} found
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <ContentfulArticleCard
                        key={post.fields.slug}
                        post={post}
                        showTags={true}
                        showReadTime={true}
                        maxTags={5}
                        cardWidth="w-full"
                        baseUrl={
                            process.env.NEXT_PUBLIC_SITE_URL ||
                            'https://weareanli.com/'
                        }
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                    >
                        Previous
                    </Button>

                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                    >
                        Next
                    </Button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading...</span>
                </div>
            )}
        </div>
    );
}
