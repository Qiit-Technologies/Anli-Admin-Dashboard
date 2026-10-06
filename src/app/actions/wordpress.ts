import axios from 'axios';

const WORDPRESS_API_BASE =
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    'https://your-wordpress-site.com/wp-json/wp/v2';

const wpApi = axios.create({
    baseURL: WORDPRESS_API_BASE,
    timeout: 10000,
});

export interface WordPressPost {
    id: number;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    excerpt: {
        rendered: string;
    };
    featured_media: number;
    date: string;
    modified: string;
    slug: string;
    categories: number[];
    tags: number[];
    author: number;
    _embedded?: {
        'wp:featuredmedia'?: Array<{
            source_url: string;
            alt_text: string;
        }>;
        'wp:term'?: Array<
            Array<{
                id: number;
                name: string;
                slug: string;
            }>
        >;
        author?: Array<{
            name: string;
            avatar_urls: Record<string, string>;
        }>;
    };
}

export interface WordPressCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
}

export interface WordPressTag {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
}

export interface WordPressAuthor {
    id: number;
    name: string;
    description: string;
    avatar_urls: Record<string, string>;
}

export async function getWordPressPosts({
    page = 1,
    perPage = 10,
    categories,
    tags,
    search,
    orderBy = 'date',
    order = 'desc',
}: {
    page?: number;
    perPage?: number;
    categories?: string;
    tags?: string;
    search?: string;
    orderBy?: 'date' | 'title' | 'modified';
    order?: 'asc' | 'desc';
} = {}): Promise<{
    posts: WordPressPost[];
    totalPages: number;
    total: number;
}> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: perPage.toString(),
            orderby: orderBy,
            order,
            _embed: 'true',
        });

        if (categories) params.append('categories', categories);
        if (tags) params.append('tags', tags);
        if (search) params.append('search', search);

        const response = await wpApi.get(`/posts?${params.toString()}`);

        return {
            posts: response.data,
            totalPages: parseInt(response.headers['x-wp-totalpages'] || '1'),
            total: parseInt(response.headers['x-wp-total'] || '0'),
        };
    } catch (error: any) {
        console.error('Error fetching WordPress posts:', error);
        throw new Error('Failed to fetch blog posts');
    }
}

export async function getWordPressPost(
    slug: string,
): Promise<WordPressPost | null> {
    try {
        const response = await wpApi.get(`/posts?slug=${slug}&_embed=true`);
        return response.data[0] || null;
    } catch (error: any) {
        console.error('Error fetching WordPress post:', error);
        return null;
    }
}

export async function getWordPressCategories(): Promise<WordPressCategory[]> {
    try {
        const response = await wpApi.get('/categories?per_page=100');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching WordPress categories:', error);
        return [];
    }
}

export async function getWordPressTags(): Promise<WordPressTag[]> {
    try {
        const response = await wpApi.get('/tags?per_page=100');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching WordPress tags:', error);
        return [];
    }
}

export async function getWordPressAuthors(): Promise<WordPressAuthor[]> {
    try {
        const response = await wpApi.get('/users?per_page=100');
        return response.data;
    } catch (error: any) {
        console.error('Error fetching WordPress authors:', error);
        return [];
    }
}
