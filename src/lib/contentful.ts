import { ContentfulResourceEntry } from '@/types/blog';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Document } from '@contentful/rich-text-types';
import { createClient } from 'contentful';

const client = createClient({
    space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID || 'test',
    accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN || 'test',
});

export type BlogPost = ContentfulResourceEntry;

export const getBlogPostsUncached = async ({
    limit = 10,
    skip = 0,
    type,
    search,
    order = '-sys.createdAt',
}: {
    limit?: number;
    skip?: number;
    type?: string;
    search?: string;
    order?: string;
} = {}): Promise<{ posts: BlogPost[]; total: number }> => {
    try {
        const query: any = {
            content_type: 'resources',
            limit,
            skip,
            order,
        };

        if (type) {
            query['fields.type'] = type;
        }

        if (search) {
            query.query = search;
        }

        const response = await client.getEntries<
            { contentTypeId: string } & ContentfulResourceEntry
        >(query);

        return {
            posts: response.items as BlogPost[],
            total: response.total,
        };
    } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        throw new Error('Failed to fetch blog posts');
    }
};

export const getTypesUncached = async (): Promise<string[]> => {
    try {
        const response = await client.getEntries({
            content_type: 'resources',
            select: ['fields.type'],
        });

        const types = response.items
            .filter((item) => item.fields && item.fields.type) // Add null check
            .map((item) => item.fields.type)
            .filter((type): type is string => typeof type === 'string')
            .filter((type, index, array) => array.indexOf(type) === index);

        return types;
    } catch (error: any) {
        console.error('Error fetching types:', error);
        return [];
    }
};

export const getBlogPostBySlugUncached = async (
    slug: string,
): Promise<BlogPost | null> => {
    try {
        const response = await client.getEntries({
            content_type: 'resources',
            'fields.slug': slug,
            limit: 1,
        });

        return (response.items[0] as BlogPost) || null;
    } catch (error: any) {
        console.error('Error fetching blog post by slug:', error);
        return null;
    }
};

export const getBlogPosts = getBlogPostsUncached;

export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
    try {
        const response = await client.getEntries<
            { contentTypeId: string } & ContentfulResourceEntry
        >({
            content_type: 'resources',
            'sys.id': id,
            limit: 1,
        });

        return (response.items[0] as BlogPost) || null;
    } catch (error: any) {
        console.error('Error fetching blog post:', error);
        return null;
    }
};

export const getBlogPostBySlug = getBlogPostBySlugUncached;

export const getTypes = getTypesUncached;

export const getTags = async (): Promise<string[]> => {
    try {
        const response = await client.getEntries({
            content_type: 'resources',
            select: ['fields.tags'],
        });

        const allTags = response.items
            .map((item) => item.fields.tags)
            .filter((tags): tags is string => typeof tags === 'string')
            .flatMap((tags) => tags.split(',').map((tag) => tag.trim()))
            .filter(
                (tag, index, array) =>
                    array.indexOf(tag) === index && tag.length > 0,
            );

        return allTags;
    } catch (error: any) {
        console.error('Error fetching tags:', error);
        return [];
    }
};

export function getContentfulImageUrl(
    image: ContentfulResourceEntry['fields']['image'],
    width?: number,
    height?: number,
): string {
    if (!image) {
        return '/images/placeholder.png';
    }

    const asset = image.fields ? image : image;

    if (!asset.fields?.file?.url) {
        return '/images/placeholder.png';
    }

    let url = asset.fields.file.url;

    if (url.startsWith('//')) {
        url = `https:${url}`;
    } else if (!url.startsWith('https://')) {
        url = `https://${url}`;
    }

    if (width || height) {
        const params = new URLSearchParams();
        if (width) params.append('w', width.toString());
        if (height) params.append('h', height.toString());
        params.append('fit', 'fill');
        params.append('fm', 'webp');
        url += `?${params.toString()}`;
    }

    return url;
}

export function getImageUrl(
    image: ContentfulResourceEntry['fields']['image'],
    width?: number,
    height?: number,
): string {
    return getContentfulImageUrl(image, width, height);
}

export function richTextToHtml(richText: Document): string {
    if (!richText) return '';

    return documentToHtmlString(richText, {
        renderNode: {
            'heading-1': (node, next) =>
                `<h1 class="text-4xl font-bold mb-6 mt-8 text-gray-900 leading-tight">${next(node.content)}</h1>`,
            'heading-2': (node, next) =>
                `<h2 class="text-3xl font-bold mb-5 mt-7 text-gray-900 leading-tight">${next(node.content)}</h2>`,
            'heading-3': (node, next) =>
                `<h3 class="text-2xl font-semibold mb-4 mt-6 text-gray-900 leading-tight">${next(node.content)}</h3>`,
            'heading-4': (node, next) =>
                `<h4 class="text-xl font-semibold mb-3 mt-5 text-gray-900 leading-tight">${next(node.content)}</h4>`,
            'heading-5': (node, next) =>
                `<h5 class="text-lg font-semibold mb-3 mt-4 text-gray-900 leading-tight">${next(node.content)}</h5>`,
            'heading-6': (node, next) =>
                `<h6 class="text-base font-semibold mb-2 mt-4 text-gray-900 leading-tight">${next(node.content)}</h6>`,

            paragraph: (node, next) =>
                `<p class="mb-6 text-gray-700 leading-relaxed text-lg">${next(node.content)}</p>`,

            'unordered-list': (node, next) =>
                `<ul class="mb-6 pl-4 space-y-2 list-disc">${next(node.content)}</ul>`,
            'ordered-list': (node, next) =>
                `<ol class="mb-6 pl-4 space-y-2 list-decimal">${next(node.content)}</ol>`,
            'list-item': (node, next) =>
                `<li class="text-gray-700 leading-relaxed">${next(node.content)}</li>`,

            blockquote: (node, next) =>
                `<blockquote class="border-l-4 border-blue-500 pl-6 py-4 mb-6 bg-gray-50 italic text-gray-800 text-lg">${next(node.content)}</blockquote>`,

            hr: () => `<hr class="my-8 border-t-2 border-gray-200" />`,

            code: (node, next) =>
                `<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">${next(node.content)}</code>`,

            table: (node, next) =>
                `<div class="overflow-x-auto mb-6"><table class="min-w-full border-collapse border border-gray-300">${next(node.content)}</table></div>`,
            'table-row': (node, next) =>
                `<tr class="border-b border-gray-200">${next(node.content)}</tr>`,
            'table-cell': (node, next) =>
                `<td class="border border-gray-300 px-4 py-2 text-gray-700">${next(node.content)}</td>`,
            'table-header-cell': (node, next) =>
                `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-gray-900">${next(node.content)}</th>`,

            bold: (node, next) =>
                `<strong class="font-semibold text-gray-900">${next(node.content)}</strong>`,
            italic: (node, next) =>
                `<em class="italic">${next(node.content)}</em>`,
            underline: (node, next) =>
                `<u class="underline">${next(node.content)}</u>`,

            hyperlink: (node, next) => {
                const uri = node.data?.uri || '#';
                return `<a href="${uri}" class="text-blue-600 hover:text-blue-800 underline transition-colors duration-200" target="_blank" rel="noopener noreferrer">${next(node.content)}</a>`;
            },

            'embedded-asset-block': (node) => {
                const asset = node.data?.target;
                if (!asset?.fields) return '';

                const { file, title, description } = asset.fields;
                if (!file?.url) return '';

                const alt = title || description || 'Blog image';
                const width = file.details?.image?.width;
                const height = file.details?.image?.height;

                if (file.contentType?.startsWith('image/')) {
                    const optimizedUrl = getContentfulImageUrl(asset, 800, 450);
                    return `
                        <figure class="my-8">
                            <img 
                                src="${optimizedUrl}" 
                                alt="${alt}" 
                                class="w-full h-auto rounded-lg shadow-lg"
                                loading="lazy"
                                ${width ? `width="${Math.min(width, 800)}"` : ''}
                                ${height ? `height="${Math.min(height, 450)}"` : ''}
                            />
                            ${title ? `<figcaption class="text-center text-sm text-gray-600 mt-3 italic">${title}</figcaption>` : ''}
                        </figure>
                    `;
                }

                if (file.contentType?.startsWith('video/')) {
                    const videoUrl = file.url.startsWith('https:')
                        ? file.url
                        : `https:${file.url}`;
                    return `
                        <figure class="my-8">
                            <video 
                                src="${videoUrl}" 
                                controls 
                                class="w-full h-auto rounded-lg shadow-lg"
                                preload="metadata"
                            >
                                Your browser does not support the video tag.
                            </video>
                            ${title ? `<figcaption class="text-center text-sm text-gray-600 mt-3 italic">${title}</figcaption>` : ''}
                        </figure>
                    `;
                }

                const fileUrl = file.url.startsWith('https:')
                    ? file.url
                    : `https:${file.url}`;
                return `
                    <div class="my-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                        <a href="${fileUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                            </svg>
                            <span class="font-medium">${title || 'Download file'}</span>
                        </a>
                        ${description ? `<p class="text-sm text-gray-600 mt-2">${description}</p>` : ''}
                    </div>
                `;
            },

            'embedded-entry-block': (node) => {
                const entry = node.data?.target;
                if (!entry?.fields || !entry.sys?.contentType?.sys?.id)
                    return '';

                const contentType = entry.sys.contentType.sys.id;

                switch (contentType) {
                    case 'codeBlock': {
                        const { code, language } = entry.fields;
                        return `
                            <div class="my-6">
                                <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code class="language-${language || 'text'}">${code || ''}</code></pre>
                            </div>
                        `;
                    }

                    case 'callout': {
                        const {
                            title: calloutTitle,
                            content,
                            type,
                        } = entry.fields;
                        const typeColors = {
                            info: 'border-blue-500 bg-blue-50 text-blue-800',
                            warning:
                                'border-yellow-500 bg-yellow-50 text-yellow-800',
                            error: 'border-red-500 bg-red-50 text-red-800',
                            success:
                                'border-green-500 bg-green-50 text-green-800',
                        };
                        const colorClass =
                            typeColors[type as keyof typeof typeColors] ||
                            typeColors.info;

                        return `
                            <div class="my-6 p-4 border-l-4 rounded-r-lg ${colorClass}">
                                ${calloutTitle ? `<h4 class="font-semibold mb-2">${calloutTitle}</h4>` : ''}
                                <div>${content || ''}</div>
                            </div>
                        `;
                    }

                    default:
                        return '';
                }
            },
        },
    });
}
