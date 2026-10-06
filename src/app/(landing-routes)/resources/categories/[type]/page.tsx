import { getBlogPostsPaginatedAction } from '@/app/actions/contentful';
import { getBlogPosts, getTypes } from '@/lib/contentful';
import { ContentfulResourceEntry } from '@/types/blog';
import { notFound } from 'next/navigation';
import BlogCategoryHeader from '../../components/BlogCategoryHeader';
import TypePageContent from '../../components/TypePageContent';

const ITEMS_PER_PAGE = 12;

function getTypeSlug(type: string): string {
    return type
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

export default async function TypePage({
    params,
}: {
    params: Promise<{ type: string }>;
}) {
    const { type: typeParams } = await params;

    const availableTypes = await getTypes();

    const matchingType = availableTypes.find((type) => {
        const typeSlugFromType = getTypeSlug(type);
        return typeSlugFromType === typeParams;
    });

    if (!matchingType) {
        notFound();
    }

    const { posts: initialPosts, total: totalPosts } = await getBlogPosts({
        type: matchingType,
        limit: ITEMS_PER_PAGE,
        skip: 0,
        order: '-sys.createdAt',
    });

    const handlePageChange = async (
        page: number,
    ): Promise<ContentfulResourceEntry[]> => {
        'use server';
        return await getBlogPostsPaginatedAction(
            matchingType,
            page,
            ITEMS_PER_PAGE,
        );
    };

    return (
        <>
            <BlogCategoryHeader matchingType={matchingType} />

            <TypePageContent
                initialPosts={initialPosts}
                totalPosts={totalPosts}
                typeName={matchingType}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
            />
        </>
    );
}

export async function generateStaticParams() {
    const types = await getTypes();

    return types.map((type) => ({
        type: getTypeSlug(type),
    }));
}
