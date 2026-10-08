'use client';
import { getStockMovementByItemId } from '@/app/actions/stock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useReport } from '@/context/useReport';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { LineChartComponent } from '../charts/LineChart';
import { StockMetricChart } from '../charts/PieChart';
import { StockRadialChart } from '../charts/RadialChart';
import { LowStockRadialChart } from '../charts/StatusRadialChart';

interface CardPatternThreeProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    parentClassName?: string;
}

interface StockCardProps {
    title: string;
    subTitle?: string;
    value: number | string;
    change: number;
    changeType: 'positive' | 'negative';
    metricName: string;
    total: number;
    chartColorIndex?: number;
    valueColor?: string;
}

export const StockMetricCard = ({
    title,
    subTitle,
    value,
    change,
    changeType,
    metricName,
    total,
    chartColorIndex,
    valueColor,
}: StockCardProps) => {
    return (
        <Card className="w-full flex rounded-lg shadow-none py-2 px-4">
            <div className="relative w-[150px] h-full">
                <StockMetricChart
                    metricName={metricName}
                    value={Number(value)}
                    total={Number(total)}
                    chartColorIndex={chartColorIndex}
                    valueColor={valueColor}
                />
            </div>
            <div className="w-full">
                <CardHeader className="px-0">
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-2 flex items-center justify-between">
                    <div className="flex flex-col gap-0">
                        {subTitle && (
                            <h2 className="text-muted-foreground text-sm">
                                {subTitle}
                            </h2>
                        )}
                        <div className="text-2xl font-bold">{value}</div>
                    </div>
                    <div
                        className={`px-3 py-1 text-xs rounded-full ${changeType === 'positive' ? 'text-green-800 bg-green-200' : 'text-red-500 bg-red-200'}`}
                    >
                        {change > 0 ? `↑ ${change}%` : `↓ ${Math.abs(change)}%`}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

export const BlockChartCard = ({
    children,
    title,
    className,
}: CardPatternThreeProps) => {
    return (
        <Card className="shadow-none overflow-y-auto overflow-x-auto overflow-hidden border rounded-md min-h-40 max-h-[500px]">
            <CardHeader className="border-b py-3">
                <div className="flex items-center py-3 justify-between">
                    <CardTitle>{title}</CardTitle>
                    {/* <Button variant="outline">Download Report</Button> */}
                </div>
            </CardHeader>
            <CardContent className={className}>{children}</CardContent>
        </Card>
    );
};

export const LowStockAlertCard = ({
    children,
    title,
    className,
}: CardPatternThreeProps) => {
    return (
        <Card className="shadow-none border rounded-md w-full">
            <CardHeader className="border-b py-3">
                <div className="flex items-center py-3 justify-between">
                    <CardTitle>{title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className={className}>{children}</CardContent>
        </Card>
    );
};

const departments = ['House Keeping', 'Restaurant', 'Kitchen', 'General'];

export const StockUsageReport = () => {
    const [departmentActive, setDepartmentActive] = useState(0);
    return (
        <BlockChartCard title="Stock Usage Report (By department)">
            <div className="w-full py-4 flex items-center gap-3 relative">
                <div className="flex items-center gap-3">
                    {departments.map((department, index) => (
                        <Button
                            key={index}
                            onClick={() => setDepartmentActive(index)}
                            className={cn(
                                'bg-transparent transition-colors hover:bg-hexbrand/10 hover:text-hexbrand text-muted-foreground rounded-md px-3 py-2',
                                index === 0 && 'border-l-0',
                                index === departments.length && 'border-r-0',
                                departmentActive === index &&
                                    'bg-hexbrand/10 text-brand',
                            )}
                            variant={'ghost'}
                            size={'sm'}
                        >
                            {department}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="relative">
                <LineChartComponent />
            </div>
        </BlockChartCard>
    );
};

export const StockMovementReport = () => {
    const { items } = useReport();
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    const labels = {
        received: 'QUANTITY RECEIVED',
        issued: 'QUANTITY ISSUED',
    };

    const [stockData, setStockData] = useState([
        { name: 'received', value: 0, fill: '#9d9e9d' },
        { name: 'issued', value: 0, fill: '#747574' },
    ]);

    const handleItemSelect = async (value: string) => {
        setSelectedItemId(value);
        if (value) {
            try {
                const response = await getStockMovementByItemId(value);
                console.log(response);
                setStockData([
                    {
                        name: 'received',
                        value: response.received,
                        fill: '#9d9e9d',
                    },
                    {
                        name: 'issued',
                        value: response.issued,
                        fill: '#747574',
                    },
                ]);
            } catch (error: any) {
                console.error('Error fetching stock movement:', error);
            }
        }
    };

    return (
        <BlockChartCard
            className="px-0"
            title="Stock Movement Report (Incoming & Outgoing)"
        >
            <div className="w-full py-4 border-b flex items-center gap-3 px-6 relative">
                <div className="flex items-center gap-3">
                    <div className="w-full max-w-md">
                        <Select
                            value={selectedItemId}
                            onValueChange={handleItemSelect}
                        >
                            <SelectTrigger className="w-full focus:ring-brand bg-gray-100">
                                <SelectValue placeholder="Select Item" />
                            </SelectTrigger>
                            <SelectContent>
                                {items?.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.itemName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-4 justify-center h-full w-full">
                <div className="relative">
                    <StockRadialChart
                        data={stockData}
                        centerText="Total balance"
                        receivedLabel="QUANTITY RECEIVED"
                        issuedLabel="QUANTITY ISSUED"
                    />
                </div>
                <div className="flex items-center gap-4">
                    {/**data set 1 */}
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-gray-400 rounded-full" />
                        <div className="flex flex-col items-centerl justify-center">
                            <span className="text-sm uppercase text-muted-foreground">
                                {labels.received}
                            </span>
                            <span className="text-2xl text-black font-bold">
                                {stockData[0].value}
                            </span>
                        </div>
                    </div>
                    {/**data set 2 */}
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-gray-400 rounded-full" />
                        <div className="flex flex-col items-centerl justify-center">
                            <span className="text-sm uppercase text-muted-foreground">
                                {labels.issued}
                            </span>
                            <span className="text-2xl text-black font-bold">
                                {stockData[1].value}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </BlockChartCard>
    );
};

export const LowStockReport = () => {
    const { items, selectedItemId, stockData, labels, handleItemSelect } =
        useReport();

    return (
        <LowStockAlertCard
            title="Low Stock Alert"
            className="px-0"
            parentClassName="col-span-2 max-w-full"
        >
            <div className="w-full py-4 border-b flex items-center gap-3 px-6 relative">
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedItemId}
                        onValueChange={handleItemSelect}
                    >
                        <SelectTrigger className="w-full focus:ring-brand bg-gray-100">
                            <SelectValue placeholder="Select Item" />
                        </SelectTrigger>
                        <SelectContent>
                            {items?.map((item: any) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.itemName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="flex items-center gap-4 justify-center h-full w-full">
                <div className="relative">
                    <StockRadialChart
                        data={stockData}
                        centerText="Total balance"
                        receivedLabel="QUANTITY RECEIVED"
                        issuedLabel="QUANTITY ISSUED"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-gray-400 rounded-full" />
                        <div className="flex flex-col items-centerl justify-center">
                            <span className="text-sm uppercase text-muted-foreground">
                                {labels.received}
                            </span>
                            <span className="text-2xl text-black font-bold">
                                {stockData[0].value}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1 bg-gray-400 rounded-full" />
                        <div className="flex flex-col items-centerl justify-center">
                            <span className="text-sm uppercase text-muted-foreground">
                                {labels.issued}
                            </span>
                            <span className="text-2xl text-black font-bold">
                                {stockData[1].value}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </LowStockAlertCard>
    );
};

export const StatusReport = () => {
    const { selectedItemName, currentStock } = useReport();
    return (
        <div className="shadow-none border bg-white rounded-md relative h-full">
            <div className="border-b p-3">
                <h1 className="uppercase text-lg">Status</h1>
                <p className="text-muted-foreground text-sm">
                    You are using 80% of available spots
                </p>
            </div>
            <div className="flex items-center justify-center w-full">
                <div className="flex items-center flex-col gap-3 w-full max-w-[300px]">
                    <LowStockRadialChart />
                    {
                        <div className="rounded-md border text-start bg-hexbrand/10 p-4 w-full">
                            <h1 className="font-semibold mb-2 line-clamp-2">
                                {selectedItemName || 'Item'} is almost out of
                                stock
                            </h1>
                            <span className="text-sm text-muted-foreground line-clamp-2">
                                {currentStock > 0
                                    ? ` Get ready to restock ${selectedItemName} because
                                we are currently left with ${currentStock} pcs`
                                    : 'No stock left'}
                            </span>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};
