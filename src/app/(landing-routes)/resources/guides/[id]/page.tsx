import { whitePapersGuide } from '@/components/landing-revised/Resources/data';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';

async function getBlogPost(id: string) {
    const posts = whitePapersGuide;
    for (const post of posts) {
        if (post.id === id) return post;
    }
    return whitePapersGuide[0];
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const post = await getBlogPost(id);
    if (!post) return { title: 'Article Not Found' };

    return {
        metadataBase: new URL('https://www.weareanli.com/'),
        title: `${post.title} | ANLI Solutions`,
        description: post.points?.[0]?.toString() || '',
        keywords: post.tags.join(', '),
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${post.title} | ANLI Solutions`,
            description: post.points?.[0]?.toString() || '',
            url: `https://www.weareanli.com/resources/${id}`,
            siteName: 'ANLI Solutions',
            images: [
                {
                    url:
                        post.image ||
                        'https://www.weareanli.com/og-resources.jpg',
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: post.datePosted,
            // modifiedTime: post.dateModified,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${post.title} | ANLI Solutions`,
            description: post.points?.[0]?.toString() || '',
            images: [
                post.image || 'https://www.weareanli.com/og-resources.jpg',
            ],
        },
        alternates: {
            canonical: `https://www.weareanli.com/resources/${id}`,
        },
    };
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const post = await getBlogPost(id);
    if (!post) notFound();

    return (
        <div className="min-h-screen bg-white">
            <Script id="schema-org" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: post.title,
                    description: post.points?.[0]?.toString() || '',
                    url: `https://www.weareanli.com/resources/${id}`,
                    image:
                        post.image ||
                        'https://www.weareanli.com/og-resources.jpg',
                    datePublished: post.datePosted,
                    //'dateModified': post.dateModified,
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
                    keywords: post.tags.join(', '),
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
                        {post.title}
                    </h1>
                    <div className="flex items-center mb-6">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-900">
                                Anli
                            </span>
                            <span className="mx-2">•</span>
                            <time>{post.datePosted || 'Date not found'}</time>
                            <span className="mx-2">•</span>
                            <span>{post.readTime}</span>
                        </div>
                    </div>
                    <div className="relative w-full h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
                        <Image
                            src={post.image || '/placeholder.svg'}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="blog-content">
                        {post.points && Array.isArray(post.points) ? (
                            <ul className="list-disc ml-4 flex flex-col gap-4">
                                {post.points.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No content available</p>
                        )}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium mb-3">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
