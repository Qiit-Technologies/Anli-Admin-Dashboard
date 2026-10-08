'use client';

import RentAmenitiesWizard from '@/components/banquest/rented-items/rent-wizard/RentAmenitiesWizard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RentAmenitiesPage() {
    return (
        <PageWrapper className="lg:px-0 gap-0 bg-gray-50/50">
            <PageHeader>
                <div className="flex w-full flex-col gap-3 px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        className="w-fit text-orion-blue hover:text-orion-blue"
                        asChild
                    >
                        <Link href="/banquet/rented-item">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title="Rent Amenities"
                        subtitle="Rent amenities for your event and occasion"
                    />
                </div>
            </PageHeader>

            <div className="px-4 pb-12 lg:px-8 mt-8">
                <RentAmenitiesWizard />
            </div>
        </PageWrapper>
    );
}
