'use client';

import React from 'react';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { AutoBillingCard } from '@/components/front-office/account-section/AutoBillingCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckoutPolicySettingsPage from '@/components/admin/settings/CheckoutPolicyTab';

export default function RoomAutoBillingPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Room Autobilling"
                    subtitle={`Transfer outstanding payment to a new guest`}
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="w-full h-[calc(100vh-120px)]">
                    <Tabs defaultValue="autobilling" className="w-full h-full">
                        <TabsList className="grid grid-cols-2 w-fit">
                            <TabsTrigger value="autobilling">
                                Room Auto billing
                            </TabsTrigger>
                            <TabsTrigger value="overstay">
                                Overstay Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="autobilling"
                            className="w-full h-[calc(100vh-180px)] overflow-auto"
                        >
                            <AutoBillingCard />
                        </TabsContent>

                        <TabsContent value="overstay" className="mt-0">
                            <CheckoutPolicySettingsPage />
                        </TabsContent>
                    </Tabs>
                </div>
            </PageWrapper>
        </div>
    );
}
