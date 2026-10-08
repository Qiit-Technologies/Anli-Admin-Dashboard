'use client';
import { getMenuCategories } from '@/app/actions/menu-category';
import { getCategoryData, getMenuCategoryStats } from '@/app/actions/order';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Archive } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import { CustomHxBarChart } from './charts/CustomHxBar';
import ReportsCard, { ReportsCardProps } from './components/ReportsCard';

const SalesCategoryReport = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const { data: menuCategoryStat } = useSWR(
        '/orders/menu-category-stats',
        getMenuCategoryStats,
    );

    const { data: categoryData } = useSWR(
        '/orders/menu-category-data',
        getCategoryData,
    );

    const { data: menuCategories } = useSWR(
        '/menu/category',
        getMenuCategories,
    );

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        console.log(selectedCategory);
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Select
                    onValueChange={handleCategoryChange}
                    defaultValue="select"
                >
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Categories</SelectLabel>
                            <SelectItem value="select">
                                Select Category
                            </SelectItem>
                            {menuCategories?.data?.map((category: any) => (
                                <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                >
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuCategoryStat?.data.map(
                    (stat: ReportsCardProps, index: number) => (
                        <ReportsCard
                            title={stat.title}
                            value={stat.value}
                            percent={stat.percent}
                            trend={stat.trend as 'up' | 'down'}
                            key={index}
                        />
                    ),
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomHxBarChart
                    DataIcon={Archive}
                    title="Sales by Menu Category"
                    subtitle="Current Month"
                    data={categoryData?.data ?? []}
                    trendPercentage={-2.1}
                    footerText="Showing revenue distribution by menu category"
                />
            </div>
        </div>
    );
};

export default SalesCategoryReport;
