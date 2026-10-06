import { ButtonProps } from '@heroui/react';

export type RawData = {
    [key: string]: {
        total: number;
        charts: Record<string, number>;
    };
};

export type CategoryType = {
    name: string;
    value: number;
};

export type TransformedData = {
    title: string;
    total: number;
    color: ButtonProps['color'];
    categories: CategoryType[];
    chartData: {
        name: string;
        [key: string]: string | number;
    }[];
};
