'use client';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import {
    issuedItemsColumn
} from '@/components/stock/tables/columns/issued-items-list';
import IssuedItemTable from '@/components/stock/tables/IssuedItemTable';
import { fetchStockApproved, StockRequest } from '@/hooks/fetcher';
import useSWR from 'swr';

const IssueStock = () => {
    const { data: stockApproved } = useSWR(
        '/items/approved',
        fetchStockApproved,
    );
    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Issued Stock"
                    subtitle="History of Stock Movement OUT — issues posted from the store ledger."
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div>
                    <IssuedItemTable
                        data={(stockApproved as StockRequest[]) ?? []}
                        columns={issuedItemsColumn}
                        // filters={issuedItemsFilters}
                        // hasHeader={true}
                        title="Recent Activities"
                    />
                </div>
            </PageWrapper>
        </div>
    );
};

export default IssueStock;
