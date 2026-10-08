import {
    getBlogPostBySlugUncached,
    getBlogPostsUncached,
    getTypesUncached,
} from '@/lib/contentful';
import { unstable_cache } from 'next/cache';

export const getTypesAction = unstable_cache(
    async () => {
        return await getTypesUncached();
    },
    ['contentful-types-action'],
    {
        revalidate: 3600,
        tags: ['contentful-types-action'],
    },
);

export const getBlogPostsAction = unstable_cache(
    async (
        params: {
            limit?: number;
            skip?: number;
            type?: string;
            search?: string;
            order?: string;
        } = {},
    ) => {
        return await getBlogPostsUncached(params);
    },
    ['contentful-posts-action'],
    {
        revalidate: 3600,
        tags: ['contentful-posts-action'],
    },
);

export const getBlogPostBySlugAction = unstable_cache(
    async (slug: string) => {
        return await getBlogPostBySlugUncached(slug);
    },
    ['contentful-post-action'],
    {
        revalidate: 3600,
        tags: ['contentful-post-action'],
    },
);

export const getBlogPostsPaginatedAction = unstable_cache(
    async (type: string, page: number, itemsPerPage: number = 12) => {
        const skip = (page - 1) * itemsPerPage;

        const { posts } = await getBlogPostsUncached({
            type,
            limit: itemsPerPage,
            skip,
            order: '-sys.createdAt',
        });

        return posts;
    },
    ['contentful-posts-paginated-action'],
    {
        revalidate: 3600,
        tags: ['contentful-posts-paginated-action'],
    },
);
