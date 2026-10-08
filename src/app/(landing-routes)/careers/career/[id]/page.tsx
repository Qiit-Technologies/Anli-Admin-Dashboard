import { featuredCareers } from '@/components/landing-revised/Careers/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Fragment } from 'react';
import CareerApplicationForm from './CareerApplicationForm';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const jobCareer = featuredCareers.find((career) => career?.id === id);
    if (!jobCareer) return { title: 'Opening Not Found' };

    return {
        metadataBase: new URL('https://www.weareanli.com/'),
        title: `${jobCareer?.title} | ANLI Solutions`,
        description: jobCareer?.roleOverview?.toString() || '',
        keywords: [
            'career',
            'job',
            'opening',
            'position',
            'frontend',
            'backend',
        ],
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title: `${jobCareer.title} | ANLI Solutions`,
            description: jobCareer?.roleOverview?.toString() || '',
            url: `https://www.weareanli.com/resources/${id}`,
            siteName: 'ANLI Solutions',
            images: [
                {
                    url: 'https://www.weareanli.com/og-resources.jpg',
                    width: 1200,
                    height: 630,
                    alt: jobCareer.title,
                },
            ],
            locale: 'en_US',
            type: 'article',
            publishedTime: jobCareer.datePosted,
            // modifiedTime: post.dateModified,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${jobCareer.title} | ANLI Solutions`,
            description: jobCareer?.roleOverview?.toString() || '',
            images: ['https://www.weareanli.com/og-resources.jpg'],
        },
        alternates: {
            canonical: `https://www.weareanli.com/resources/${id}`,
        },
    };
}

export default async function Career({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const jobCareer = featuredCareers.find((career) => career?.id === id);
    if (!jobCareer) notFound();

    return (
        <div className="min-h-screen bg-white">
            <Script id="schema-org" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    headline: jobCareer.title,
                    description: jobCareer?.roleOverview?.toString() || '',
                    url: `https://www.weareanli.com/carreers/${id}`,
                    image: 'https://www.weareanli.com/og-resources.jpg',
                    datePublished: jobCareer.datePosted,
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
                    keywords: [
                        'career',
                        'job',
                        'opening',
                        'position',
                        'frontend',
                        'backend',
                    ],
                })}
            </Script>
            <main className="container mx-auto px-4 py-40 max-w-4xl">
                <article className="prose lg:prose-xl max-w-none">
                    <div>
                        <div className="mt-10 mb-5 text-center">
                            {jobCareer?.title && (
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {jobCareer?.title}
                                </h2>
                            )}

                            {jobCareer?.location && (
                                <h2 className="text-mg font-medium text-gray-500 mt-1">
                                    {jobCareer?.location}
                                </h2>
                            )}
                        </div>

                        {jobCareer?.roleOverview && (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-5">
                                    Overview
                                </h2>
                                <p className="mb-5">{jobCareer.roleOverview}</p>
                            </>
                        )}

                        {!jobCareer?.aboutAnli?.length ? null : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-5">
                                    About ANLI
                                </h2>
                                <p className="mb-5">
                                    {jobCareer.aboutAnli?.map((about) => (
                                        <Fragment key={about}>
                                            {about}
                                            <br />
                                            <br />
                                        </Fragment>
                                    ))}
                                </p>
                            </>
                        )}

                        {!jobCareer?.keyResponsibility?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    Key Responsibilities:
                                </h3>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.keyResponsibility?.map(
                                        (responsibility) => (
                                            <li key={responsibility}>
                                                {responsibility}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}

                        {!jobCareer?.requirements?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    Requirements
                                </h3>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.requirements?.map(
                                        (requirements) => (
                                            <li key={requirements}>
                                                {requirements}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}

                        {!jobCareer?.niceToHave?.length ? null : (
                            <>
                                <h4 className="text-lg font-bold text-gray-700 mt-8 mb-4">
                                    Bonus Skills:
                                </h4>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.niceToHave?.map(
                                        (niceToHave) => (
                                            <li key={niceToHave}>
                                                {niceToHave}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}

                        {!jobCareer?.whatWeOffer?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    What we offer
                                </h3>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.whatWeOffer?.map(
                                        (whatWeOffer) => (
                                            <li key={whatWeOffer}>
                                                {whatWeOffer}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}
                    </div>

                    <div>
                        {!jobCareer?.detailedResponsibility?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    Key Responsibilities:
                                </h3>
                                <div>
                                    {jobCareer?.detailedResponsibility?.map(
                                        (respData) => (
                                            <div
                                                className="pl-2"
                                                key={respData.title}
                                            >
                                                <p className="text-orion-blue font-bold text-lg mb-1">
                                                    {respData.title}
                                                </p>
                                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                                    {respData?.responsibility?.map(
                                                        (resp) => (
                                                            <li key={resp}>
                                                                {resp}
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        {!jobCareer?.kpi?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    Performance Metrics (KPIs):
                                </h3>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.kpi?.map((kpi) => (
                                        <li key={kpi}>{kpi}</li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {!jobCareer?.expectation?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    Expectations
                                </h3>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.expectation?.map(
                                        (expectation) => (
                                            <li key={expectation}>
                                                {expectation}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}

                        {!jobCareer?.toolsAndResources?.length ? null : (
                            <>
                                <h4 className="text-lg font-bold text-gray-700 mt-8 mb-4">
                                    Tools & Resources Provided
                                </h4>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.toolsAndResources?.map(
                                        (toolsAndResources) => (
                                            <li key={toolsAndResources}>
                                                {toolsAndResources}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}

                        {!jobCareer?.growthOpportunities?.length ? null : (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                                    Growth Opportunities
                                </h3>
                                <ul className="list-disc pl-6 mb-6 space-y-2">
                                    {jobCareer?.growthOpportunities?.map(
                                        (growthOpportunities) => (
                                            <li key={growthOpportunities}>
                                                {growthOpportunities}
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                </article>

                <h2 className="text-2xl font-bold text-gray-900 mt-16 text-center">
                    Interested?
                </h2>

                <CareerApplicationForm positionTitle={jobCareer.title} />
            </main>
        </div>
    );
}
