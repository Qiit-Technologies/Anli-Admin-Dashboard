'use client';
import Section from '@/components/landing-revised/layout/Section';
import NewsLetter from '@/components/landing-revised/NewsLetter';
import {
    featuredCareers,
    CareerCardProps,
} from '@/components/landing-revised/Careers/data';
// import HeroImage from '@/components/landing-revised/Careers/HeroImage';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, Search } from 'lucide-react';
// import Image from 'next/image';
import Link from 'next/link';
import React, { ReactNode, useState } from 'react';
// import SmoothScroll from '@/components/landing-revised/SmoothScroll';
// import Heading from '@/components/landing-revised/layout/Heading';

function SearchInput({
    placeholder = 'Search...',
    value,
    onChange,
}: {
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="relative w-full lg:w-fit">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={onChange}
                type="search"
                placeholder={placeholder}
                className="pl-10 w-full h-10 focus-visible:ring-hexbrand"
            />
        </div>
    );
}

const ResourceCategoryList = ({
    children,
    className,
}: {
    className?: string;
    children: ReactNode;
}) => {
    return (
        <div className={className}>
            <ScrollArea className="w-full">
                <div className="flex flex-wrap justify-between gap-y-7 py-4">
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
};

type CardProps = {
    id: string;
    title: string;
    location: string;
    roleOverview: string;
};

const CareerCard = ({ id, title, location, roleOverview }: CardProps) => {
    return (
        <div className="group flex flex-col  w-[350px] lg:w-[32%] items-center gap-2 border rounded-xl overflow-hidden">
            <div className="p-4 flex flex-col gap-2 w-full flex-1">
                <h1 className="font-bold text-lg">{title}</h1>
                <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                    {location}
                </p>
                <span className="text-sm text-muted-foreground line-clamp-5 mt-1">
                    {roleOverview}
                </span>
                <div className="mt-3">
                    <Link
                        className="text-orange-700 text-xs flex items-center gap-2"
                        href={`/careers/career/${id}`}
                    >
                        Apply <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const CareersPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const filterCareers = (career: CareerCardProps[]) => {
        if (!searchQuery.trim()) return career;

        const query = searchQuery.toLowerCase();
        return career.filter(
            (resource) =>
                resource.title.toLowerCase().includes(query) ||
                (resource.roleOverview &&
                    resource.roleOverview.toLowerCase().includes(query)) ||
                (resource.requirements &&
                    resource.requirements.some((requirement) =>
                        requirement.toLowerCase().includes(query),
                    )),
        );
    };

    const filteredFeaturedCareers = filterCareers(featuredCareers);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div>
            {/* <Section
                bgClassName="bg-black"
                className="h-screen flex flex-col gap-5 py-24"
            >
                <div className="text-white text-center mt-8">
                    <h1 className="text-3xl font-bold">Careers at Anli</h1>
                    <p>Highlighted Opportunities for you to explore</p>
                </div>
                <div className="w-full flex items-center justify-center mt-8">
                    <div className="max-w-4xl">
                        <HeroImage />
                    </div>
                </div>
            </Section> */}
            <Section className="gap-6 py-24">
                {/* <SmoothScroll>
                    <Section className="relative flex flex-col gap-4 lg:py-24 lg:px-0">
                        <div
                            className={
                                ' w-full grid mt-5 grid-cols-1 lg:grid-cols-2'
                            }
                        >
                            <div className="w-full flex-col px-0 lg-mt-0 lg:pr-20 gap-3 h-full flex justify-center">
                                <Heading style={{ alignSelf: 'flex-start' }}>
                                    About ANLI Solutions
                                </Heading>
                                <p className="text-muted-foreground">
                                    ANLI Solutions is building innovative
                                    property and hospitality management systems
                                    that empower hoteliers, restaurants, and
                                    facility managers to streamline operations,
                                    manage inventories, handle accounting, and
                                    optimize revenue. Our platform is
                                    fast-growing, and we are looking for a
                                    talented Frontend Developer to join our
                                    team.
                                </p>
                            </div>
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="w-full relative h-[200px] lg:h-[400px] flex items-center justify-center">
                                    <Image
                                        src="/landing/aboutus/section2.jpg"
                                        fill
                                        className="w-full h-full object-cover rounded-3xl"
                                        style={{ objectFit: 'cover' }}
                                        alt="group of people laughing"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>
                </SmoothScroll> */}

                <div className="mt-5 flex w-full flex-col lg:flex-row gap-4 lg:gap-0 items-center justify-between">
                    <h1 className="text-orion-blue">
                        Open roles and positions
                    </h1>
                    <SearchInput
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {filteredFeaturedCareers.length > 0 && (
                    <ResourceCategoryList className="mt-3">
                        {filteredFeaturedCareers.map((info) => {
                            return (
                                <CareerCard
                                    key={info?.id}
                                    id={info?.id}
                                    title={info?.title}
                                    location={info?.location}
                                    roleOverview={info?.roleOverview}
                                />
                            );
                        })}
                    </ResourceCategoryList>
                )}

                {filteredFeaturedCareers.length === 0 && searchQuery && (
                    <div className="w-full text-center py-10">
                        <p>No resources found matching {searchQuery}</p>
                    </div>
                )}
            </Section>
            <NewsLetter />
        </div>
    );
};

export default CareersPage;
