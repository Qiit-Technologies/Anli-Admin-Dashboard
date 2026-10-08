import SocialShare from '@/app/(landing-routes)/resources/components/SocialShare';
import { getContentfulImageUrl } from '@/lib/contentful';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ContentfulResourceEntry {
    fields: {
        title: string;
        description: string;
        slug: string;
        type: string;
        image?: any;
        readTime?: number;
        tags?: string;
    };
}

interface ContentfulArticleCardProps {
    post: ContentfulResourceEntry;
    showTags?: boolean;
    showReadTime?: boolean;
    maxTags?: number;
    imageWidth?: number;
    imageHeight?: number;
    cardWidth?: string;
    baseUrl?: string;
}

const ContentfulArticleCard = ({
    post,
    showTags = true,
    showReadTime = true,
    maxTags = 3,
    imageWidth = 350,
    imageHeight = 200,
    cardWidth = 'w-[350px] lg:w-[350px]',
    baseUrl,
}: ContentfulArticleCardProps) => {
    const imageUrl = post.fields.image
        ? getContentfulImageUrl(post.fields.image, imageWidth, imageHeight)
        : '/images/placeholder.png';

    const windowLocation =
        typeof window !== 'undefined'
            ? `${window.location.origin}/resources/${post.fields.slug}`
            : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/resources/${post.fields.slug}`;

    const blogUrl = baseUrl
        ? `${baseUrl}/resources/${post.fields.slug}`
        : windowLocation;

    return (
        <Link href={`/resources/${post.fields.slug}`} className="block">
            <div
                className={`group h-full flex flex-col ${cardWidth} items-center gap-2 border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-orange-200`}
            >
                <div
                    className={`relative w-full flex items-center justify-center h-[${imageHeight}px] overflow-hidden`}
                >
                    <Image
                        src={imageUrl}
                        alt={post.fields.title}
                        fill
                        priority
                        className="object-cover group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-3">
                        <div
                            className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <SocialShare
                                url={blogUrl}
                                title={post.fields.title}
                                description={post.fields.description}
                                variant="compact"
                                showLabels={false}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-2 w-full flex-1">
                    <h1 className="font-bold group-hover:text-orange-600 transition-colors duration-200">
                        {post.fields.title}
                    </h1>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.fields.description}
                    </p>
                    {showReadTime && post.fields.readTime && (
                        <span className="text-xs text-muted-foreground">
                            {post.fields.readTime} min read
                        </span>
                    )}
                    {showTags &&
                        post.fields.tags &&
                        post.fields.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 my-2">
                                {post.fields.tags
                                    ?.split(',')
                                    .slice(0, maxTags)
                                    .map((tag, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                                        >
                                            {tag.trim()}
                                        </span>
                                    ))}
                            </div>
                        )}
                    <div className="mt-auto">
                        <span className="text-orange-700 text-xs flex items-center gap-2 group-hover:text-orange-800 transition-colors duration-200">
                            Read post{' '}
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ContentfulArticleCard;
