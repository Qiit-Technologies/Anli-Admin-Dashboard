import HomeClient from '@/components/landing-revised/HomeClient';
import type { Metadata } from 'next';
import Script from 'next/script';
export const metadata: Metadata = {
    metadataBase: new URL('https://www.weareanli.com/'),
    title: 'ANLI Solutions | Best Hotel Management Software',
    description:
        'Discover ANLI Solutions, the leading hotel management software to streamline operations, boost revenue, and enhance guest experiences.',
    keywords:
        'hotel management software, property management system, hospitality technology',
    robots: { index: true, follow: true },
    openGraph: {
        title: 'ANLI Solutions | Best Hotel Management Software',
        description:
            'Streamline hotel operations and elevate guest experiences with ANLI Solutions’ all-in-one management software.',
        url: 'https://www.weareanli.com/',
        siteName: 'ANLI Solutions',
        images: [
            {
                url: 'https://www.weareanli.com/anli-logo.jpg',
                width: 1200,
                height: 630,
                alt: 'ANLI Solutions Homepage',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ANLI Solutions | Best Hotel Management Software',
        description:
            'Discover ANLI Solutions, the ultimate hotel management software for smarter operations.',
        images: ['https://www.weareanli.com/anli-logo.jpg'],
    },
    alternates: { canonical: 'https://www.weareanli.com/' },
};

export default function HomePage() {
    return (
        <>
            <Script id="schema-org-home" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    name: 'ANLI Solutions Homepage',
                    url: 'https://www.weareanli.com/',
                    description:
                        'ANLI Solutions offers a smart hotel management system to optimize operations, enhance guest experiences, and maximize revenue.',
                    publisher: {
                        '@type': 'Organization',
                        name: 'ANLI Solutions',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://www.weareanli.com/anli-logo.png',
                        },
                    },
                })}
            </Script>
            <HomeClient />
        </>
    );
}
