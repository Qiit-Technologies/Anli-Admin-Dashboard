'use client';

import { LucideExternalLink, LucideHelpCircle, Search } from 'lucide-react';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { LuBell, LuExternalLink, LuMail } from 'react-icons/lu';

export default function SupportPage() {
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Support Center"
                    subtitle={
                        'Get help with your account, billing, and technical issues.'
                    }
                />
                <div className="ml-auto flex items-center">
                    <Button className="ml-4 bg-white rounded-full border text-gray-400">
                        <LuBell size={18} />
                    </Button>
                </div>
            </PageHeader>
            <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search for help..."
                    className="pl-10 w-full max-w-lg"
                />
            </div>
            <div className="grid gap-6 md:grid-cols-1">
                <Card className="overflow-hidden shadow-none">
                    <CardContent className="p-0">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <LuMail className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-lg">
                                    General Inquiries
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                For general questions about our services and
                                company
                            </p>
                            <Link
                                href="mailto:info@weareanli.com"
                                className="flex items-center gap-2 text-primary hover:underline font-medium"
                            >
                                info@weareanli.com
                                <LucideExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden shadow-none">
                    <CardContent className="p-0">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <LucideHelpCircle className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium text-lg">
                                    Technical Support
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                For help with technical issues or
                                account-related problems
                            </p>
                            <Link
                                href="mailto:support@weareanli.com"
                                className="flex items-center gap-2 text-primary hover:underline font-medium"
                            >
                                support@weareanli.com
                                <LuExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageWrapper>
    );
}
