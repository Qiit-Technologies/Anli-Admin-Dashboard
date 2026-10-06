'use client';

import CreateMenuPackageWizard from '@/components/banquest/menu/package-wizard/CreateMenuPackageWizard';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateMenuPackagePage() {
    return (
        <PageWrapper className="lg:px-0">
            <PageHeader>
                <div className="flex w-full flex-col gap-3">
                    <Button
                        variant="ghost"
                        className="w-fit px-0 text-orion-blue hover:text-orion-blue"
                        asChild
                    >
                        <Link href="/banquet/menu-details">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title="Create New Menu Package"
                        subtitle="Follow the steps below to create a new menu package."
                    />
                </div>
            </PageHeader>
            <div className="mx-auto w-full max-w-6xl px-4 pb-16 lg:px-8">
                <CreateMenuPackageWizard />
            </div>
        </PageWrapper>
    );
}
