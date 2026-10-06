'use client';

import { ContentfulResourceEntry } from '@/types/blog';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getContentfulImageUrl } from '@/lib/contentful';

interface ResourcesByType {
    [key: string]: ContentfulResourceEntry[];
}
interface ResourcesDisplayProps {
    initialResourcesByType: ResourcesByType;
    availableTypes: string[];
}

export default function ResourceDisplay2({
    initialResourcesByType,
    availableTypes,
}: ResourcesDisplayProps) {
    const router = useRouter();

    const filteredResourcesByType = (type: string) =>
        initialResourcesByType[type];

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
            {availableTypes.map((type) => {
                const filteredResources = filteredResourcesByType(type) || [];

                return (
                    <div
                        key={type}
                        className="lg:flex grid grid-cols-2 w-full overflow-x-scroll items-center gap-x-8 gap-y-6 mt-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {filteredResources.map((post) => (
                            <div
                                key={post.fields.title}
                                className="col-span-2 min-w-full lg:min-w-[600px] rounded-2xl border border-[#EAECF0]"
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
                                            {post.fields.description}
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
                );
            })}
        </>
    );
}
