'use client';

import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import { StockItemForm } from '@/components/stock/Form/StockItemForm';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CreateStockItem = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            <PageHeader>
                <PageHeadertitle title="Add New Item" />
                <HeaderActions />
            </PageHeader>

            <div className="max-w-[1200px] mx-auto px-6 py-5">
                <button
                    type="button"
                    onClick={() => router.push('/stock/items')}
                    className="flex items-center text-muted-foreground text-sm font-medium mb-5 hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </button>

                <StockItemForm
                    mode="create"
                    onSuccess={() => router.push('/stock/items')}
                    onCancel={() => router.push('/stock/items')}
                />
            </div>
        </div>
    );
};

export default CreateStockItem;
