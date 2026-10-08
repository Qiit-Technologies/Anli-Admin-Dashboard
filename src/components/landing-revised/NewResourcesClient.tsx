import NewSection from '@/components/landing-revised/layout/NewSection';
import { getBlogPosts, getTags, getTypes } from '@/lib/contentful';
import { ContentfulResourceEntry } from '@/types/blog';
import LandingLayout from '@/components/landing-revised/new-layout/Layout';
import SmoothScroll from '@/components/landing-revised/SmoothScroll';
import NewResourcesDesc from '@/components/landing-revised/NewResourcesDesc';
import ResourceDisplay from '@/components/landing-revised/new-layout/ResourceDisplay';
import ResourceDisplay2 from '@/components/landing-revised/new-layout/ResourceDisplay2';
import NewNewsLetter from '@/components/landing-revised/NewNewsLetter';

interface ResourcesByType {
    [key: string]: ContentfulResourceEntry[];
}

export default async function NewResourcesClient() {
    const types = await getTypes();
    const availableTags = await getTags();

    const resourcesData: ResourcesByType = {};

    for (const type of types) {
        const { posts } = await getBlogPosts({
            type,
            limit: 6,
            order: '-sys.createdAt',
        });
        resourcesData[type] = posts;
    }

    const handleFiltersChange = async (
        _searchQuery: string,
        _sortOption: string,
        // eslint-disable-next-line no-unused-vars
        _tags: string[] = [],
    ) => {
        'use server';
    };

    return (
        <LandingLayout>
            <NewSection
                bgClassName="relative pt-[17vh] lg:pt-[202px]"
                bgChildren={
                    <>
                        <img
                            src="/landing/layer-icons/layer9.svg"
                            className="absolute bottom-0 left-0 z-10"
                        />
                        <img
                            src="/landing/layer-icons/layer10.svg"
                            className="absolute bottom-0 right-0 z-10"
                        />
                    </>
                }
                className="h-fit pb-24 lg:pb-16 bg-[#F9FAFB]"
            >
                <div>
                    <p className="text-[#002955] text-center text-[36px] lg:text-[50px] font-bold leading-[64px] tracking-[-0.72px] lg:tracking-[-0.5px]">
                        Our Resource
                    </p>
                    <p className=" text-justify lg:text-center mx-auto max-w-[1047px] text-[#002955] text-[16px] lg:text-[18px] font-normal leading-[32px] lg:leading-[38px] tracking-[-0.5px] mt-4">
                        Your go-to hub for hospitality growth. Discover the
                        latest trends, expert strategies, and practical insights
                        to help you run smarter hotels and restaurants, elevate
                        guest experiences, and stay ahead in the fast-changing
                        world of hospitality.
                    </p>
                </div>
            </NewSection>
            <NewSection className="pt-11 pb-0">
                <ResourceDisplay
                    initialResourcesByType={resourcesData}
                    availableTypes={types}
                    availableTags={availableTags}
                    onFiltersChange={handleFiltersChange}
                />
            </NewSection>
            <SmoothScroll>
                <NewResourcesDesc />
            </SmoothScroll>
            <NewSection bgClassName="lg:px-0" className="pt-0 pb-0 lg:px-0">
                <ResourceDisplay2
                    initialResourcesByType={resourcesData}
                    availableTypes={types}
                />
            </NewSection>
            <SmoothScroll>
                <div className="my-8">
                    <NewNewsLetter />
                </div>
            </SmoothScroll>
        </LandingLayout>
    );
}
