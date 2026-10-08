'use client';

import EmptyState from '@/components/common/EmptyState';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { BarChartComponent } from '@/components/house-keeping/common/charts/BarChart';
import CleaningStaffPieChart from '@/components/house-keeping/common/charts/PieChart';
import { AreaChartComponent } from '@/components/house-keeping/common/charts/Reports';
import { reportIllustration } from '@/components/house-keeping/common/illustrations';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import { Button } from '@/components/ui/button';
import { fetchHousekeepingReports } from '@/hooks/fetcher';
import { Filter } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

//const pastButtons = ['12m', '30d', '7d', '24h'];
const ReportsPage = () => {
    // const [reports, setReports] = useState<number[]>([]);

    const { data: reports } = useSWR(
        '/housekeeping/reports',
        fetchHousekeepingReports,
    );
    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle title="Reports" subtitle={`View reports`} />
                <div className="ml-auto flex items-center">
                    <NotificationsPopover />
                </div>
            </PageHeader>
            {reports ? (
                <>
                    <div className="flex flex-col gap-3">
                        <div className="flex w-full items-center">
                            <div>
                                {/* <div className="rounded-lg border overflow-hidden">
                                    {pastButtons.map((button, index) => (
                                        <Button
                                            key={index}
                                            className={cn(
                                                index === 0 && 'border-l-0',
                                                index === pastButtons.length &&
                                                    'border-r-0',
                                                'rounded-none bg-white hover:bg-gray-100 text-black border-x',
                                            )}
                                        >
                                            {button}
                                        </Button>
                                    ))}
                                </div> */}
                            </div>
                            <div className="ml-auto">
                                <div className="flex items-center gap-2">
                                    <Link href="/house-keeping/productivity#cleaning-trends">
                                        <Button type="button" variant={'outline'}>
                                            <Filter />
                                            Date filters
                                        </Button>
                                    </Link>
                                    <Link href="/house-keeping/productivity">
                                        <Button variant={'outline'}>
                                            Productivity
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
                            <AreaChartComponent title="Staff Performance" />
                            <AreaChartComponent title="Lost and Found" />
                            <AreaChartComponent title="Guest Requests" />
                            <AreaChartComponent title="Maintenance" />
                        </div>
                    </div>
                    <div className="w-full gap-4 grid grid-cols-1 lg:grid-cols-2">
                        <BarChartComponent />
                        <CleaningStaffPieChart />
                    </div>
                </>
            ) : (
                <div className="w-full min-h-full mt-20 flex items-center justify-center">
                    <EmptyState
                        icon={reportIllustration}
                        title="Activities Report"
                        description="Once you start using the system, you will be able to view your activities report here."
                    >
                        {/* <Button
                            onClick={() => setReports([1, 2, 3])}
                            className="bg-orion-blue hover:bg-orion-blue text-white rounded-md mt-5"
                        >
                            View Report Dummy
                        </Button> */}
                    </EmptyState>
                </div>
            )}
        </PageWrapper>
    );
};

export default ReportsPage;
