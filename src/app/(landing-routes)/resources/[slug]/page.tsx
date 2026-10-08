import {
    getBlogPostBySlug,
    getBlogPostsUncached,
    getImageUrl,
    richTextToHtml,
} from '@/lib/contentful';
import { ContentfulResourceEntry } from '@/types/blog';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ReadingProgress from '../components/ReadingProgress';
import SocialShare from '../components/SocialShare';

async function getBlogPost(
    slug: string,
): Promise<ContentfulResourceEntry | null> {
    try {
        const post = await getBlogPostBySlug(slug);
        return post;
    } catch (error: any) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const imageUrl = post.fields.image
        ? getImageUrl(post.fields.image, 800, 400)
        : '/placeholder.svg';

    const contentHtml = richTextToHtml(post.fields.content);
    const tags =
        post.fields.tags
            ?.split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0) || [];

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Date not available';
        }
    };

    const currentUrl = `https://www.weareanli.com/resources/${slug}`;

    return (
        <div className="min-h-screen bg-white">
            <ReadingProgress target=".blog-content" />

            <Script id="schema-org" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: post.fields.title,
                    description: post.fields.description,
                    url: `https://www.weareanli.com/resources/${slug}`,
                    image: imageUrl,
                    datePublished: post.fields.datePosted,
                    dateModified: post.sys.updatedAt,
                    publisher: {
                        '@type': 'Organization',
                        name: 'ANLI Solutions',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://www.weareanli.com/anli-logo.png',
                        },
                    },
                    author: {
                        '@type': 'Organization',
                        name: 'ANLI Solutions',
                    },
                    keywords: tags.join(', '),
                })}
            </Script>
            <main className="container mx-auto px-4 py-40 max-w-4xl">
                <Link
                    href="/resources"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all posts
                </Link>
                <article className="prose lg:prose-xl max-w-none">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        {post.fields.title}
                    </h1>
                    <div className="flex items-center mb-6">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">
                                ANLI Solutions
                            </span>
                            <span className="mx-2">•</span>
                            <time>{formatDate(post.fields.datePosted)}</time>
                            {post.fields.readTime && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{post.fields.readTime} min read</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        <SocialShare
                            url={currentUrl}
                            title={post.fields.title}
                            description={post.fields.description}
                        />
                    </div>

                    {post.fields.image && (
                        <div className="relative w-full h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
                            <Image
                                src={imageUrl}
                                alt={post.fields.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}
                    <div className="mb-6">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {post.fields.description}
                        </p>
                    </div>
                    <div
                        className="blog-content prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: contentHtml,
                        }}
                    />
                    {tags.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-medium mb-3">Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <SocialShare
                            url={currentUrl}
                            title={post.fields.title}
                            description={post.fields.description}
                        />
                    </div>
                </article>

                <SocialShare
                    url={currentUrl}
                    title={post.fields.title}
                    description={post.fields.description}
                    variant="floating"
                />
            </main>
        </div>
    );
}

export async function generateStaticParams() {
    try {
        const { posts } = await getBlogPostsUncached({ limit: 1000 });

        return posts
            .filter((post) => post.fields.slug)
            .map((post) => ({
                slug: post.fields.slug,
            }));
    } catch (error: any) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);
    if (!post) return { title: 'Article Not Found' };

    const imageUrl = post.fields.image
        ? getImageUrl(post.fields.image, 1200, 630)
        : 'https://www.weareanli.com/og-resources.jpg';

    return {
        metadataBase: new URL('https://www.weareanli.com/'),
        title: `${post.fields.title} | ANLI Solutions`,
        description: post.fields.description,
        keywords: post.fields.tags
            ?.split(',')
            .map((tag) => tag.trim())
            .join(', '),
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${post.fields.title} | ANLI Solutions`,
            description: post.fields.description,
            url: `https://www.weareanli.com/resources/${slug}`,
            siteName: 'ANLI Solutions',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.fields.title,
                },
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: post.fields.datePosted,
            modifiedTime: post.sys.updatedAt,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${post.fields.title} | ANLI Solutions`,
            description: post.fields.description,
            images: [imageUrl],
        },
    };
}
