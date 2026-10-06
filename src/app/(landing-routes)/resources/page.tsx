import Section from '@/components/landing-revised/layout/Section';
import NewsLetter from '@/components/landing-revised/NewsLetter';
// import HeroImage from '@/components/landing-revised/Resources/HeroImage';
import { getBlogPosts, getTags, getTypes } from '@/lib/contentful';
import { ContentfulResourceEntry } from '@/types/blog';
import ResourcesDisplay from './components/ResourceDisplay';

interface ResourcesByType {
    [key: string]: ContentfulResourceEntry[];
}

export default async function ResourcesPage() {
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
        <div>
            {/* <Section
                bgClassName="bg-black"
                className="h-screen flex z-[1] flex-col gap-5 py-24"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '20px 20px',
                }}
            >
                <div className="text-white text-center mt-8 z-[2]">
                    <h1 className="text-3xl font-bold">Our Resources</h1>
                    <p>
                        Stay ahead of the curve with insights, trends, and
                        strategies for modern hoteliers.
                    </p>
                </div>
                <div className="w-full flex items-center justify-center mt-8">
                    <div className="max-w-4xl">
                        <HeroImage />
                    </div>
                </div>
            </Section> */}
            <Section className="gap-6 py-24">
                <ResourcesDisplay
                    initialResourcesByType={resourcesData}
                    availableTypes={types}
                    availableTags={availableTags}
                    onFiltersChange={handleFiltersChange}
                />
            </Section>
            <NewsLetter />
        </div>
    );
}
