'use client';

import { getTaxAndChargesReport } from '@/app/actions/guest';
import { DatePicker } from '@/components/common/DatePicker';
import { InputField, SelectField } from '@/components/common/Form';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import EmptyReportState from '@/components/front-office/night-audit-report/EmptyReportState';
import { useUser } from '@/context/useUser';
import { useVoidReportOptions } from '@/hooks/useVoidReportOptions';
import { downloadData } from '@/lib/downloadData';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

type TaxChargesFilters = {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    user: string;
    chargeType: string;
};

type TaxChargesItem = {
    date: string;
    transactionId: string;
    guestName: string;
    chargeRate: number;
    chargeAmount: number;
};

type TaxChargesData = {
    summary: {
        totalStays: number;
        chargeType: string;
        chargeRate: number;
        totalCollected: number;
    };
    items: TaxChargesItem[];
    generatedAt?: string;
    generatedBy?: string;
};

const today = new Date().toISOString().split('T')[0];

export default function TaxChargesReportPage() {
    const { user } = useUser();
    const filterOptions = useVoidReportOptions();

    const [filters, setFilters] = useState<TaxChargesFilters>({
        startDate: today,
        endDate: today,
        startTime: '00:00',
        endTime: '23:59',
        user: 'all',
        chargeType: 'VAT',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<TaxChargesData | null>(null);

    const updateFilter = <K extends keyof TaxChargesFilters>(
        key: K,
        value: TaxChargesFilters[K],
    ) => setFilters((prev) => ({ ...prev, [key]: value }));

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const result = await getTaxAndChargesReport({
                startDate: filters.startDate,
                endDate: filters.endDate,
                startTime: filters.startTime,
                endTime: filters.endTime,
                user: filters.user,
                chargeType: filters.chargeType,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            setReportData(result.data as TaxChargesData);
            toast.success('Report generated successfully');
        } catch {
            toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (!reportData) return;
        const rows = reportData.items.map((item) => ({
            Date: item.date,
            'Transaction ID': item.transactionId,
            'Guest Name': item.guestName,
            'Charge Rate (%)': item.chargeRate,
            'Charge Amount': item.chargeAmount,
        }));

        downloadData(
            rows,
            'xlsx',
            `Tax-Charges-Report-${filters.startDate}-${filters.endDate}`,
        );
    };

    const handlePrint = () => {
        if (!reportData) return;
        const win = window.open('', '_blank');
        if (!win) return;

        const rowsHtml = reportData.items
            .map(
                (item) => `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.transactionId}</td>
                    <td>${item.guestName}</td>
                    <td>${item.chargeRate}%</td>
                    <td>${formatCurrency(item.chargeAmount)}</td>
                </tr>`,
            )
            .join('');

        const generatedBy =
            reportData.generatedBy || user?.fullName || 'System';

        win.document
            .write(`<!doctype html><html><head><meta charset="utf-8"/><title>Tax & Charges Report</title>
            <style>
              body{font-family:sans-serif;padding:24px;color:#111}
              h1{font-size:22px;margin-bottom:4px}
              .meta{color:#666;font-size:12px;margin-bottom:12px}
              .summary{margin:10px 0 16px;padding:10px;background:#f6f8fb;border-radius:6px;font-size:13px}
              table{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
              th,td{border:1px solid #ddd;padding:6px;text-align:left}
              th{background:#f4f4f4}
            </style></head><body>
            <h1>Tax & Charges Report</h1>
            <div class="meta">Report period: ${filters.startDate} ${filters.startTime} → ${filters.endDate} ${filters.endTime}</div>
            <div class="meta">Printed at: ${new Date().toLocaleString()} · Printed by: ${generatedBy}</div>
            <div class="summary"><strong>Summary</strong><br/>
              Total stays: ${reportData.summary.totalStays} ·
              Charge type: ${reportData.summary.chargeType} ·
              Charge rate: ${reportData.summary.chargeRate}% ·
              Total collected: ${formatCurrency(reportData.summary.totalCollected)}
            </div>
            <table><thead><tr>
              <th>Date</th><th>Transaction ID</th><th>Guest Name</th><th>Charge Rate</th><th>Charge Amount</th>
            </tr></thead><tbody>${rowsHtml}</tbody></table>
            <script>window.onload=()=>{window.print();window.close();}</script>
            </body></html>`);
        win.document.close();
    };

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <PageHeadertitle
                        title="Tax & Charges Report"
                        subtitle="See all activities carried out (VAT, Service Charge & Custom Charges)"
                    />
                </div>
            </PageHeader>

            <div className="bg-white rounded-lg border border-gray-200 mt-4 overflow-hidden">
                <div className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Start Date
                        </label>
                        <DatePicker
                            id="startDate"
                            name="startDate"
                            value={filters.startDate}
                            onChange={(v) => updateFilter('startDate', v)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            Start Time
                        </label>
                        <InputField
                            id="startTime"
                            name="startTime"
                            label=""
                            type="time"
                            value={filters.startTime}
                            onChange={(e) =>
                                updateFilter('startTime', e.target.value)
                            }
                            className="h-10"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            End Date
                        </label>
                        <DatePicker
                            id="endDate"
                            name="endDate"
                            value={filters.endDate}
                            onChange={(v) => updateFilter('endDate', v)}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">
                            End Time
                        </label>
                        <InputField
                            id="endTime"
                            name="endTime"
                            label=""
                            type="time"
                            value={filters.endTime}
                            onChange={(e) =>
                                updateFilter('endTime', e.target.value)
                            }
                            className="h-10"
                        />
                    </div>
                </div>

                <div className="p-4 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                    <SelectField
                        id="user"
                        name="user"
                        label="User (Staff)"
                        value={filters.user}
                        onValueChange={(v) => updateFilter('user', v)}
                        options={[
                            { value: 'all', label: 'All' },
                            ...filterOptions.staffOptions,
                        ]}
                    />
                    <SelectField
                        id="chargeType"
                        name="chargeType"
                        label="Charge Type"
                        value={filters.chargeType}
                        onValueChange={(v) => updateFilter('chargeType', v)}
                        options={[
                            { value: 'VAT', label: 'VAT' },
                            {
                                value: 'SERVICE_CHARGE',
                                label: 'Service Charge',
                            },
                            {
                                value: 'CUSTOM_CHARGE',
                                label: 'Custom Charge',
                            },
                        ]}
                    />
                    <ButtonRow
                        onGenerate={handleGenerate}
                        onExport={handleExport}
                        onPrint={handlePrint}
                        loading={isLoading}
                        disabled={!reportData}
                    />
                </div>

                {reportData ? (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                            <SummaryCard
                                title="Total Stays"
                                value={String(reportData.summary.totalStays)}
                            />
                            <SummaryCard
                                title="Charge Type"
                                value={reportData.summary.chargeType}
                            />
                            <SummaryCard
                                title="Charge Rate"
                                value={`${reportData.summary.chargeRate}%`}
                            />
                            <SummaryCard
                                title="Total Collected"
                                value={formatCurrency(
                                    reportData.summary.totalCollected,
                                )}
                            />
                        </div>

                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#F7F9FC] text-gray-600">
                                    <tr>
                                        <th className="text-left py-3 px-4">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4">
                                            Transaction ID
                                        </th>
                                        <th className="text-left py-3 px-4">
                                            Guest Name
                                        </th>
                                        <th className="text-left py-3 px-4">
                                            Charge Rate
                                        </th>
                                        <th className="text-left py-3 px-4">
                                            Charge Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.items.map((item, index) => (
                                        <tr
                                            key={`${item.date}-${index}`}
                                            className="border-t"
                                        >
                                            <td className="py-3 px-4">
                                                {item.date}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.transactionId}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.guestName}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.chargeRate}%
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatCurrency(
                                                    item.chargeAmount,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <EmptyReportState
                            title="No results found"
                            description="Select filters and click Generate to see tax and charges report."
                        />
                    </div>
                )}
            </div>
        </PageWrapper>
    );
}

function SummaryCard({
    title,
    value,
}: Readonly<{ title: string; value: string }>) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-[#11315B] mt-1">
                {value}
            </p>
        </div>
    );
}

function ButtonRow({
    onGenerate,
    onExport,
    onPrint,
    loading,
    disabled,
}: Readonly<{
    onGenerate: () => void;
    onExport: () => void;
    onPrint: () => void;
    loading: boolean;
    disabled: boolean;
}>) {
    return (
        <div className="lg:col-span-2 flex justify-start lg:justify-end gap-2 flex-wrap">
            <button
                type="button"
                className="h-10 px-4 rounded-md bg-orion-blue text-white text-sm disabled:opacity-60"
                onClick={onGenerate}
                disabled={loading}
            >
                {loading ? 'Generating...' : 'Generate report'}
            </button>
            <button
                type="button"
                className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-60"
                onClick={onExport}
                disabled={disabled}
            >
                Export Excel
            </button>
            <button
                type="button"
                className="h-10 px-4 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-60"
                onClick={onPrint}
                disabled={disabled}
            >
                Print
            </button>
        </div>
    );
}
