export type BanquetFilterFieldType =
    | 'select'
    | 'text'
    | 'amountMin'
    | 'amountMax';

export interface BanquetFilterOption {
    value: string;
    label: string;
}

export interface BanquetFilterField {
    key: string;
    label: string;
    type: BanquetFilterFieldType;
    placeholder?: string;
    options?: BanquetFilterOption[];
}

export interface BanquetReportColumn {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
}

export interface BanquetSummaryCard {
    key: string;
    label: string;
    isCurrency?: boolean;
    isPercent?: boolean;
}

export type BanquetReportRow = Record<string, string | number>;

export interface BanquetReportData {
    items: BanquetReportRow[];
    summary: Record<string, number>;
    generatedAt?: string;
}

export interface BanquetReportFiltersState {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    [key: string]: string;
}

export interface BanquetReportHeaderInfo {
    hotelName: string;
    printedAt: string;
    dateRange: string;
    generatedBy: string;
    generatedAt: string;
    filterSummary: string;
}

export type BanquetReportDataSource = 'api' | 'preview';

export interface BanquetReportConfig {
    slug: string;
    title: string;
    subtitle: string;
    description: string;
    /** `api` = live hotel data; `preview` = sample seed data only */
    dataSource?: BanquetReportDataSource;
    filters: BanquetFilterField[];
    columns: BanquetReportColumn[];
    summaryCards: BanquetSummaryCard[];
    seedRows: BanquetReportRow[];
    computeSummary: (rows: BanquetReportRow[]) => Record<string, number>;
}
