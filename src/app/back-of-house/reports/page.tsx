'use client';
import OrderManagement from '@/components/back-of-house/Reports/OrderManagement';
import SalesReport from '@/components/back-of-house/Reports/Sales';
import StaffPerformance from '@/components/back-of-house/Reports/StaffPerformance';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
    {
        id: '1',
        label: 'Sales Report',
        value: 'sales-report',
    },
    {
        id: '2',
        label: 'Order Mangement Report',
        value: 'order-mangement-report',
    },
    {
        id: '3',
        label: 'Staff Performance Report',
        value: 'staff-performance-report',
    },
];

export default function ReportsPage() {
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Reports"
                    subtitle={`Reports as of ${new Date().getFullYear()}`}
                />
            </PageHeader>
            <Tabs defaultValue="sales-report">
                <TabsList className="w-full mb-4 px-0 justify-start gap-4 bg-transparent">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            className="text-base px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                            key={tab.id}
                            value={tab.value}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value="sales-report">
                    <SalesReport />
                </TabsContent>
                <TabsContent value="order-mangement-report">
                    <OrderManagement />
                </TabsContent>
                <TabsContent value="staff-performance-report">
                    <StaffPerformance />
                </TabsContent>
            </Tabs>
        </PageWrapper>
    );
}
