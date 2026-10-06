'use client';
import { fetchItems } from '@/app/actions/items';
import { getLowStockByItemId } from '@/app/actions/stock';
import { createContext, ReactNode, useContext, useState } from 'react';
import useSWR from 'swr';

interface ReportContextType {
    items: any;
    selectedItemId: string;
    selectedItemName: string;
    currentStock: number;
    stockData: Array<{
        name: string;
        value: number;
        fill: string;
    }>;
    labels: {
        received: string;
        issued: string;
    };
    handleItemSelect: (value: string) => Promise<void>;
    refreshItems: () => void;
}

const REPORT_ITEMS_KEY = 'report-items';

const ReportContext = createContext<ReportContextType | undefined>(undefined);

interface ReportProviderProps {
    children: ReactNode;
}

export function ReportProvider({ children }: ReportProviderProps) {
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [selectedItemName, setSelectedItemName] = useState<string>('');
    const [currentStock, setCurrentStock] = useState<number>(0);
    const [stockData, setStockData] = useState([
        { name: 'received', value: 0, fill: '#9d9e9d' },
        { name: 'issued', value: 0, fill: '#747574' },
    ]);

    const { data: items, mutate: refreshItems } = useSWR(
        REPORT_ITEMS_KEY,
        async () => {
            const result = (await fetchItems()) as any;
            if (result.data.statusCode > 400) {
                return [];
            }
            return result.data.data;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        },
    );

    const labels = {
        received: 'MINIMUM REQUIRED',
        issued: 'CURRENT STOCK',
    };

    const handleItemSelect = async (value: string) => {
        setSelectedItemId(value);
        const selectedItem = (items ?? []).find(
            (item: any) => item.id === value,
        );
        if (selectedItem) {
            setSelectedItemName(selectedItem.itemName);
        }

        if (value) {
            try {
                const response = await getLowStockByItemId(value);
                setStockData([
                    {
                        name: 'received',
                        value: response.total,
                        fill: '#1a8dffa9',
                    },
                    {
                        name: 'issued',
                        value: response.minStock,
                        fill: '#1A8CFF',
                    },
                ]);
                setCurrentStock(response.quantity);
            } catch (error: any) {
                console.error('Error fetching stock movement:', error);
            }
        }
    };

    const value: ReportContextType = {
        items: items ?? [],
        selectedItemId,
        selectedItemName,
        currentStock,
        stockData,
        labels,
        handleItemSelect,
        refreshItems,
    };

    return (
        <ReportContext.Provider value={value}>
            {children}
        </ReportContext.Provider>
    );
}

export const useReport = (): ReportContextType => {
    const context = useContext(ReportContext);
    if (context === undefined) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
};
