'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import PageWrapper from '@/components/common/PageWrapper';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import {
    ReportFilters,
    ReportResponse,
    SalesVsStockData,
    fetchSalesVsStockReport,
    fetchItemPerformanceReport,
    fetchVarianceReport,
    fetchStockMovementHistoryReport,
    fetchStockTransferReport,
    fetchPurchaseRestockReport,
    fetchWastageSpoilageReport,
    fetchExpiryPerishablesReport,
    fetchDepartmentUsageReport,
    fetchProfitMarginReport,
    fetchSalesSummaryReport,
    fetchStockValueReport,
    fetchProteinStockReport,
    fetchProductionReport,
    fetchBarStockReport,
    fetchRecipeCostingReport,
    fetchReturnVoucherReport,
    fetchStoreIssueReport,
} from '@/app/actions/reports';
import { Download } from 'lucide-react';
import { DatePicker } from '@/components/common/DatePicker';
import { Pagination } from '@/components/common/Pagination';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';

const REPORT_TYPES = [
    { value: 'sales-vs-stock', label: 'Sales vs Stock Report' },
    { value: 'item-performance', label: 'Item Performance Report' },
    { value: 'variance', label: 'Variance Report' },
    { value: 'stock-movement-history', label: 'Stock Movement History Report' },
    { value: 'stock-transfer', label: 'Stock Transfer Report' },
    { value: 'purchase-restock', label: 'Purchase & Restock Report' },
    { value: 'wastage-spoilage', label: 'Wastage & Spoilage Report' },
    { value: 'expiry-perishables', label: 'Expiry & Perishables Report' },
    { value: 'department-usage', label: 'Department Usage Report' },
    { value: 'profit-margin', label: 'Profit Margin Report' },
    { value: 'sales-summary', label: 'Sales Summary Report' },
    { value: 'stock-value', label: 'Stock Value Report' },
    { value: 'protein-stock', label: 'Protein Stock Report' },
    { value: 'production', label: 'Production Report' },
    { value: 'bar-stock', label: 'Bar Stock Report' },
    { value: 'recipe-costing', label: 'Recipe Costing Report' },
    { value: 'return-voucher', label: 'Return Voucher Report' },
    { value: 'store-issue', label: 'Store Issue Report' },
];

const ReportsPage = () => {
    const [selectedReport, setSelectedReport] = useState('sales-vs-stock');
    const [filters, setFilters] = useState<ReportFilters>({
        startDate: '',
        endDate: '',
        department: '',
        category: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // SWR hooks for different report types
    const {
        data: salesVsStockData,
        error: salesVsStockError,
        isLoading: salesVsStockLoading,
    } = useSWR(
        selectedReport === 'sales-vs-stock'
            ? ['sales-vs-stock', filters]
            : null,
        () => fetchSalesVsStockReport(filters),
    );

    const {
        data: itemPerformanceData,
        error: itemPerformanceError,
        isLoading: itemPerformanceLoading,
    } = useSWR(
        selectedReport === 'item-performance'
            ? ['item-performance', filters]
            : null,
        () => fetchItemPerformanceReport(filters),
    );

    const {
        data: varianceData,
        error: varianceError,
        isLoading: varianceLoading,
    } = useSWR(
        selectedReport === 'variance' ? ['variance', filters] : null,
        () => fetchVarianceReport(filters),
    );

    const {
        data: stockMovementData,
        error: stockMovementError,
        isLoading: stockMovementLoading,
    } = useSWR(
        selectedReport === 'stock-movement-history'
            ? ['stock-movement-history', filters]
            : null,
        () => fetchStockMovementHistoryReport(filters),
    );

    const {
        data: stockTransferData,
        error: stockTransferError,
        isLoading: stockTransferLoading,
    } = useSWR(
        selectedReport === 'stock-transfer'
            ? ['stock-transfer', filters]
            : null,
        () => fetchStockTransferReport(filters),
    );

    const {
        data: purchaseRestockData,
        error: purchaseRestockError,
        isLoading: purchaseRestockLoading,
    } = useSWR(
        selectedReport === 'purchase-restock'
            ? ['purchase-restock', filters]
            : null,
        () => fetchPurchaseRestockReport(filters),
    );

    const {
        data: wastageSpoilageData,
        error: wastageSpoilageError,
        isLoading: wastageSpoilageLoading,
    } = useSWR(
        selectedReport === 'wastage-spoilage'
            ? ['wastage-spoilage', filters]
            : null,
        () => fetchWastageSpoilageReport(filters),
    );

    const {
        data: expiryPerishablesData,
        error: expiryPerishablesError,
        isLoading: expiryPerishablesLoading,
    } = useSWR(
        selectedReport === 'expiry-perishables'
            ? ['expiry-perishables', filters]
            : null,
        () => fetchExpiryPerishablesReport(filters),
    );

    const {
        data: departmentUsageData,
        error: departmentUsageError,
        isLoading: departmentUsageLoading,
    } = useSWR(
        selectedReport === 'department-usage'
            ? ['department-usage', filters]
            : null,
        () => fetchDepartmentUsageReport(filters),
    );

    const {
        data: profitMarginData,
        error: profitMarginError,
        isLoading: profitMarginLoading,
    } = useSWR(
        selectedReport === 'profit-margin' ? ['profit-margin', filters] : null,
        () => fetchProfitMarginReport(filters),
    );

    const {
        data: salesSummaryData,
        error: salesSummaryError,
        isLoading: salesSummaryLoading,
    } = useSWR(
        selectedReport === 'sales-summary' ? ['sales-summary', filters] : null,
        () => fetchSalesSummaryReport(filters),
    );

    const {
        data: stockValueData,
        error: stockValueError,
        isLoading: stockValueLoading,
    } = useSWR(
        selectedReport === 'stock-value' ? ['stock-value', filters] : null,
        () => fetchStockValueReport(filters),
    );

    const {
        data: proteinStockData,
        error: proteinStockError,
        isLoading: proteinStockLoading,
    } = useSWR(
        selectedReport === 'protein-stock'
            ? ['protein-stock', filters]
            : null,
        () => fetchProteinStockReport(filters),
    );

    const {
        data: productionData,
        error: productionError,
        isLoading: productionLoading,
    } = useSWR(
        selectedReport === 'production' ? ['production', filters] : null,
        () => fetchProductionReport(filters),
    );

    const {
        data: barStockData,
        error: barStockError,
        isLoading: barStockLoading,
    } = useSWR(
        selectedReport === 'bar-stock' ? ['bar-stock', filters] : null,
        () => fetchBarStockReport(filters),
    );

    const {
        data: recipeCostingData,
        error: recipeCostingError,
        isLoading: recipeCostingLoading,
    } = useSWR(
        selectedReport === 'recipe-costing'
            ? ['recipe-costing', filters]
            : null,
        () => fetchRecipeCostingReport(filters),
    );

    const {
        data: returnVoucherData,
        error: returnVoucherError,
        isLoading: returnVoucherLoading,
    } = useSWR(
        selectedReport === 'return-voucher'
            ? ['return-voucher', filters]
            : null,
        () => fetchReturnVoucherReport(filters),
    );

    const {
        data: storeIssueData,
        error: storeIssueError,
        isLoading: storeIssueLoading,
    } = useSWR(
        selectedReport === 'store-issue' ? ['store-issue', filters] : null,
        () => fetchStoreIssueReport(filters),
    );

    // Helper function to extract the actual data array from different report structures
    const getReportDataArray = (data: unknown): unknown[] => {
        if (!data) return [];

        // Convert to object for easier access
        const dataObj = data as any;

        // Try different possible data structures in order of likelihood
        const possibleArrays = [
            data, // Direct array
            dataObj?.data, // One level nested (ReportResponse.data)
            dataObj?.items, // Alternative nesting (used by some endpoints)
            dataObj?.data?.data, // Double nested (e.g. SalesVsStockData)
            dataObj?.data?.items, // Mixed nesting
        ];

        for (const possibleArray of possibleArrays) {
            if (Array.isArray(possibleArray)) {
                return possibleArray;
            }
        }

        return [];
    };

    // Helper function to get record count based on data structure
    const getRecordCount = (data: unknown): number => {
        return getReportDataArray(data).length;
    };

    // Get current report data, loading, and error states
    const getCurrentReportData = () => {
        switch (selectedReport) {
            case 'sales-vs-stock':
                return {
                    data: salesVsStockData,
                    loading: salesVsStockLoading,
                    error: salesVsStockError,
                };
            case 'item-performance':
                return {
                    data: itemPerformanceData,
                    loading: itemPerformanceLoading,
                    error: itemPerformanceError,
                };
            case 'variance':
                return {
                    data: varianceData,
                    loading: varianceLoading,
                    error: varianceError,
                };
            case 'stock-movement-history':
                return {
                    data: stockMovementData,
                    loading: stockMovementLoading,
                    error: stockMovementError,
                };
            case 'stock-transfer':
                return {
                    data: stockTransferData,
                    loading: stockTransferLoading,
                    error: stockTransferError,
                };
            case 'purchase-restock':
                return {
                    data: purchaseRestockData,
                    loading: purchaseRestockLoading,
                    error: purchaseRestockError,
                };
            case 'wastage-spoilage':
                return {
                    data: wastageSpoilageData,
                    loading: wastageSpoilageLoading,
                    error: wastageSpoilageError,
                };
            case 'expiry-perishables':
                return {
                    data: expiryPerishablesData,
                    loading: expiryPerishablesLoading,
                    error: expiryPerishablesError,
                };
            case 'department-usage':
                return {
                    data: departmentUsageData,
                    loading: departmentUsageLoading,
                    error: departmentUsageError,
                };
            case 'profit-margin':
                return {
                    data: profitMarginData,
                    loading: profitMarginLoading,
                    error: profitMarginError,
                };
            case 'sales-summary':
                return {
                    data: salesSummaryData,
                    loading: salesSummaryLoading,
                    error: salesSummaryError,
                };
            case 'stock-value':
                return {
                    data: stockValueData,
                    loading: stockValueLoading,
                    error: stockValueError,
                };
            case 'protein-stock':
                return {
                    data: proteinStockData,
                    loading: proteinStockLoading,
                    error: proteinStockError,
                };
            case 'production':
                return {
                    data: productionData,
                    loading: productionLoading,
                    error: productionError,
                };
            case 'bar-stock':
                return {
                    data: barStockData,
                    loading: barStockLoading,
                    error: barStockError,
                };
            case 'recipe-costing':
                return {
                    data: recipeCostingData,
                    loading: recipeCostingLoading,
                    error: recipeCostingError,
                };
            case 'return-voucher':
                return {
                    data: returnVoucherData,
                    loading: returnVoucherLoading,
                    error: returnVoucherError,
                };
            case 'store-issue':
                return {
                    data: storeIssueData,
                    loading: storeIssueLoading,
                    error: storeIssueError,
                };
            default:
                return { data: null, loading: false, error: null };
        }
    };

    const reportData = getCurrentReportData();
    console.log(reportData);
    // Export report function
    const exportReport = async () => {
        console.log('Export Report - Starting export for:', selectedReport);
        console.log('Report Data:', reportData);

        if (reportData.loading || getRecordCount(reportData?.data) === 0) {
            console.log('Export Report - No data available or loading');
            return;
        }

        try {
            const columns = getTableColumns();
            console.log('Export Report - Columns:', columns);

            // Handle different data structures with a safe type cast
            let dataArray: any[] = [];
            const reportDataObj = reportData?.data as any;

            if (Array.isArray(reportDataObj)) {
                dataArray = reportDataObj;
                console.log(
                    'Export Report - Using direct array data, length:',
                    dataArray.length,
                );
            } else if (reportDataObj && typeof reportDataObj === 'object') {
                console.log(
                    'Export Report - Data is object, checking nested properties',
                );
                // If data is an object with nested data property
                if (Array.isArray(reportDataObj.data)) {
                    dataArray = reportDataObj.data;
                    console.log(
                        'Export Report - Using data.data, length:',
                        dataArray.length,
                    );
                } else if (
                    reportDataObj.items &&
                    Array.isArray(reportDataObj.items)
                ) {
                    dataArray = reportDataObj.items;
                    console.log(
                        'Export Report - Using data.items, length:',
                        dataArray.length,
                    );
                } else {
                    // Convert object values to array if it's a single object
                    dataArray = [reportDataObj];
                    console.log(
                        'Export Report - Converting single object to array',
                    );
                }
            } else {
                console.error(
                    'Export Report - Invalid data structure:',
                    typeof reportDataObj,
                );
                return;
            }

            if (dataArray.length === 0) {
                console.error(
                    'Export Report - No data available for export after processing',
                );
                return;
            }

            console.log(
                'Export Report - Processing',
                dataArray.length,
                'records',
            );

            const exportData = dataArray.map((item: any) => {
                const row: Record<string, any> = {};

                // Direct mapping for better data extraction
                switch (selectedReport) {
                    case 'variance':
                        row['Item Name'] =
                            item.itemName || item.item_name || '';
                        row['Expected Sales'] =
                            item.expectedSales || item.expected_sales || '';
                        row['Actual Sales'] =
                            item.actualSales || item.actual_sales || '';
                        row['Variance'] = item.variance || '';
                        row['Variance %'] =
                            item.variancePercentage ||
                            item.variance_percentage ||
                            '';
                        break;
                    case 'sales-vs-stock':
                        row['Date'] = item.date || '';
                        row['Item'] =
                            item.item || item.itemName || item.item_name || '';
                        row['Category'] = item.category || '';
                        row['Qty Sold'] = item.qtySold || item.qty_sold || '';
                        row['Sales UoM'] =
                            item.salesUoM || item.sales_uom || '';
                        row['Qty in Stock'] =
                            item.qtyInStock || item.qty_in_stock || '';
                        row['Stock UoM'] =
                            item.stockUoM || item.stock_uom || '';
                        row['Cost/Unit'] =
                            item.costPerUnit || item.cost_per_unit || '';
                        row['Selling'] =
                            item.selling ||
                            item.sellingPrice ||
                            item.selling_price ||
                            '';
                        row['Total Sales'] =
                            item.totalSales || item.total_sales || '';
                        row['Inventory'] = item.inventory || '';
                        row['Variance'] = item.variance || '';
                        row['Remarks'] = item.remarks || '';
                        break;
                    case 'item-performance':
                        row['Item Name'] =
                            item.itemName || item.item_name || '';
                        row['Category'] = item.category || '';
                        row['Units Sold'] =
                            item.unitsSold || item.units_sold || '';
                        row['Revenue'] = item.revenue || '';
                        row['Profit'] = item.profit || '';
                        row['Score'] = item.score || '';
                        break;
                    case 'protein-stock':
                        row['Item Name'] = item.itemName || '';
                        row['PPP'] = item.piecesPerPortion || '';
                        row['Opening'] = item.openingDisplay || '';
                        row['Received'] = item.inPieces || '';
                        row['Issued'] = item.outPieces || '';
                        row['Closing'] = item.closingDisplay || '';
                        row['Unit Cost'] = item.unitCost || '';
                        row['Value'] = item.value || '';
                        break;
                    case 'production':
                        row['Batch No.'] = item.batchNo || '';
                        row['Date'] = item.date || '';
                        row['Recipe'] = item.recipe || '';
                        row['Output Qty'] = item.outputQuantity || '';
                        row['Total Cost'] = item.totalCost || '';
                        row['Cost/Unit'] = item.costPerUnit || '';
                        row['Produced By'] = item.producedBy || '';
                        break;
                    case 'bar-stock':
                        row['Item'] = item.item || '';
                        row['Category'] = item.category || '';
                        row['Opening'] = item.opening || '';
                        row['Issued'] = item.issued || '';
                        row['Sold'] = item.sold || '';
                        row['Closing'] = item.closing || '';
                        row['Value'] = item.value || '';
                        break;
                    case 'recipe-costing':
                        row['Recipe'] = item.recipeName || '';
                        row['Output Item'] = item.outputItem || '';
                        row['Output Qty'] = item.outputQuantity || '';
                        row['Ingredients'] = item.ingredientCount || '';
                        row['Total Cost'] = item.totalCost || '';
                        row['Cost/Unit'] = item.costPerUnit || '';
                        break;
                    case 'return-voucher':
                        row['RTV No.'] = item.rtvNo || '';
                        row['Date'] = item.date || '';
                        row['From Department'] = item.fromDepartment || '';
                        row['Items'] = item.items || '';
                        row['Value'] = item.totalValue || '';
                        row['Received By'] = item.receivedBy || '';
                        break;
                    case 'store-issue':
                        row['SIV No.'] = item.sivNo || '';
                        row['Date'] = item.date || '';
                        row['Department'] = item.department || '';
                        row['Receiving Officer'] =
                            item.receivingOfficer || '';
                        row['Items'] = item.items || '';
                        row['Value'] = item.totalValue || '';
                        break;
                    default:
                        // Fallback: try to extract all available data
                        Object.keys(item).forEach((key) => {
                            const columnName = key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase());
                            row[columnName] = item[key];
                        });
                }

                return row;
            });

            // Create CSV content
            const csvContent = [
                columns.join(','),
                ...exportData.map((row) =>
                    columns
                        .map((col) => {
                            const value = row[col] || '';
                            // Escape quotes and commas in CSV
                            const escapedValue = String(value).replace(
                                /"/g,
                                '""',
                            );
                            return `"${escapedValue}"`;
                        })
                        .join(','),
                ),
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], {
                type: 'text/csv;charset=utf-8;',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Export error:', error);
        }
    };

    // Get table columns based on report type
    const getTableColumns = () => {
        switch (selectedReport) {
            case 'variance':
                return [
                    'Item Name',
                    'Expected Sales',
                    'Actual Sales',
                    'Variance',
                    'Variance %',
                ];
            case 'sales-vs-stock':
                return [
                    'Date',
                    'Item',
                    'Category',
                    'Qty Sold',
                    'Sales UoM',
                    'Qty in Stock',
                    'Stock UoM',
                    'Cost/Unit',
                    'Selling',
                    'Total Sales',
                    'Inventory',
                    'Variance',
                    'Remarks',
                ];
            case 'item-performance':
                return [
                    'Item Name',
                    'Category',
                    'Units Sold',
                    'Revenue',
                    'Profit',
                    'Score',
                ];
            case 'stock-movement-history':
                return [
                    'Date',
                    'Item',
                    'Type',
                    'Quantity',
                    'From',
                    'To',
                    'Reference',
                ];
            case 'stock-transfer':
                return [
                    'Transfer ID',
                    'Date',
                    'From',
                    'To',
                    'Items',
                    'Value',
                    'Status',
                ];
            case 'purchase-restock':
                return [
                    'Order ID',
                    'Date',
                    'Supplier',
                    'Items',
                    'Cost',
                    'Status',
                ];
            case 'wastage-spoilage':
                return [
                    'Item',
                    'Category',
                    'Quantity',
                    'Reason',
                    'Value',
                    'Date',
                ];
            case 'expiry-perishables':
                return [
                    'Item Name',
                    'Category',
                    'Quantity',
                    'Expiry Date',
                    'Days to Expiry',
                    'Value',
                ];
            case 'department-usage':
                return [
                    'Department',
                    'Total Usage',
                    'Items Used',
                    'Top Item',
                    'Top Item Qty',
                    'Efficiency',
                ];
            case 'profit-margin':
                return [
                    'Item Name',
                    'Category',
                    'Revenue',
                    'Cost',
                    'Profit',
                    'Margin %',
                ];
            case 'sales-summary':
                return ['Period', 'Sales', 'Orders', 'Avg Order'];
            case 'stock-value':
                return [
                    'Category',
                    'Total Value',
                    'Item Count',
                    'Avg Item Value',
                ];
            case 'protein-stock':
                return [
                    'Item Name',
                    'PPP',
                    'Opening',
                    'Received',
                    'Issued',
                    'Closing',
                    'Unit Cost',
                    'Value',
                ];
            case 'production':
                return [
                    'Batch No.',
                    'Date',
                    'Recipe',
                    'Output Qty',
                    'Total Cost',
                    'Cost/Unit',
                    'Produced By',
                ];
            case 'bar-stock':
                return [
                    'Item',
                    'Category',
                    'Opening',
                    'Issued',
                    'Sold',
                    'Closing',
                    'Value',
                ];
            case 'recipe-costing':
                return [
                    'Recipe',
                    'Output Item',
                    'Output Qty',
                    'Ingredients',
                    'Total Cost',
                    'Cost/Unit',
                ];
            case 'return-voucher':
                return [
                    'RTV No.',
                    'Date',
                    'From Department',
                    'Items',
                    'Value',
                    'Received By',
                ];
            case 'store-issue':
                return [
                    'SIV No.',
                    'Date',
                    'Department',
                    'Receiving Officer',
                    'Items',
                    'Value',
                ];
            default:
                return [
                    'Item Name',
                    'Expected Sales',
                    'Actual Sales',
                    'Variance',
                    'Variance %',
                ];
        }
    };

    // Render table cell content
    const renderTableCell = (row: any, column: string) => {
        switch (column) {
            case 'Item Name':
                return row.itemName || row.name || '-';
            case 'Expected Sales':
                return row.expectedSales || 0;
            case 'Actual Sales':
                return row.actualSales || 0;
            case 'Variance':
                return row.variance || 0;
            case 'Variance %':
                return `${row.variancePercent || 0}%`;
            case 'Date':
                return row.date || '-';
            case 'Item':
                return row.item || '-';
            case 'Category':
                return row.category || '-';
            case 'Qty Sold':
                return row.qtySold || 0;
            case 'Sales UoM':
                return row.salesUoM || '-';
            case 'Qty in Stock':
                return row.qtyInStock || 0;
            case 'Stock UoM':
                return row.stockUoM || '-';
            case 'Cost/Unit':
                return formatCurrency(row.costPerUnit || 0);
            case 'Selling':
                return formatCurrency(row.sellingPrice || 0);
            case 'Total Sales':
                return formatCurrency(row.totalSales || 0);
            case 'Inventory':
                return formatCurrency(row.inventoryValue || 0);
            case 'Remarks':
                return row.remarks || '-';
            case 'Units Sold':
                return row.unitsSold || 0;
            case 'Revenue':
                return formatCurrency(row.revenue || 0);
            case 'Profit':
                return formatCurrency(row.profit || 0);
            case 'Score':
                return `${row.performanceScore || 0}%`;
            case 'Type':
                return row.type || '-';
            case 'Quantity':
                return row.quantity || 0;
            case 'From':
                return row.from || '-';
            case 'To':
                return row.to || '-';
            case 'Reference':
                return row.reference || '-';
            case 'Transfer ID':
                return row.id || '-';
            case 'Items':
                return row.items || '-';
            case 'Value':
                return formatCurrency(row.totalValue || row.value || 0);
            case 'Status':
                return row.status || '-';
            case 'Order ID':
                return row.id || '-';
            case 'Supplier':
                return row.supplier || '-';
            case 'Cost':
                return formatCurrency(row.totalCost || row.cost || 0);
            case 'Reason':
                return row.reason || '-';
            case 'Expiry Date':
                return row.expiryDate || '-';
            case 'Days to Expiry':
                return row.daysToExpiry || 0;
            case 'Department':
                return row.name || '-';
            case 'Total Usage':
                return formatCurrency(row.totalUsage || 0);
            case 'Items Used':
                return row.itemsUsed || 0;
            case 'Top Item':
                return row.topItem || '-';
            case 'Top Item Qty':
                return row.topItemQuantity || 0;
            case 'Efficiency':
                return `${row.efficiency || 0}%`;
            case 'Margin %':
                return `${row.margin || 0}%`;
            case 'Period':
                return row.period || '-';
            case 'Orders':
                return row.orders || 0;
            case 'Avg Order':
                return formatCurrency(row.avgOrder || 0);
            case 'Total Value':
                return formatCurrency(row.totalValue || 0);
            case 'Item Count':
                return row.itemCount || 0;
            case 'Avg Item Value':
                return formatCurrency(row.avgItemValue || 0);
            case 'PPP':
                return row.piecesPerPortion || '-';
            case 'Opening':
                return row.openingDisplay || row.opening || '-';
            case 'Received':
                return row.inPieces ?? row.received ?? '-';
            case 'Issued':
                return row.outPieces ?? row.issued ?? '-';
            case 'Closing':
                return row.closingDisplay || row.closing || '-';
            case 'Unit Cost':
                return formatCurrency(row.unitCost || 0);
            case 'Batch No.':
                return row.batchNo || '-';
            case 'Recipe':
                return row.recipe || row.recipeName || '-';
            case 'Output Qty':
                return (
                    row.outputQuantity ??
                    row.outputQty ??
                    '-'
                );
            case 'Total Cost':
                return formatCurrency(row.totalCost || 0);
            case 'Cost/Unit':
                return formatCurrency(row.costPerUnit || 0);
            case 'Produced By':
                return row.producedBy || '-';
            case 'Sold':
                return row.sold || 0;
            case 'Output Item':
                return row.outputItem || '-';
            case 'Ingredients':
                return row.ingredientCount || row.ingredients || 0;
            case 'RTV No.':
                return row.rtvNo || '-';
            case 'From Department':
                return row.fromDepartment || '-';
            case 'Received By':
                return row.receivedBy || '-';
            case 'SIV No.':
                return row.sivNo || '-';
            case 'Receiving Officer':
                return row.receivingOfficer || '-';
            default:
                return '-';
        }
    };

    const columns = getTableColumns();
    const selectedReportLabel =
        REPORT_TYPES.find((r) => r.value === selectedReport)?.label || '';

    return (
        <div className="flex flex-col h-full  bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Report Configuration"
                    subtitle="Comprehensive reporting interface for inventory and sales activities"
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper className="bg-white ">
                {/* Report Configuration Section */}
                <div className="bg-white  mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">
                            Select report type and configure filters to view
                            detailed analytics
                        </p>
                        <Button
                            onClick={exportReport}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
                            disabled={
                                reportData.loading ||
                                getRecordCount(reportData?.data) === 0
                            }
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                        </Button>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="mb-4 flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                Report Type
                            </label>

                            <Select
                                value={selectedReport}
                                onValueChange={setSelectedReport}
                            >
                                <SelectTrigger className="bg-white border-gray-300 h-10 w-[220px]">
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>

                                <SelectContent>
                                    {REPORT_TYPES.map((report) => (
                                        <SelectItem
                                            key={report.value}
                                            value={report.value}
                                        >
                                            {report.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-[#F5F9FF] px-4 py-12">
                        <div className="flex items-center gap-8 flex-wrap">
                            {/* Start Date */}
                            <div className="flex items-center gap-2 min-w-fit h-9">
                                <label className="text-xs text-gray-600 mt-[4px] whitespace-nowrap">
                                    Start Date
                                </label>

                                <div className="w-[160px] h-9">
                                    <DatePicker
                                        value={filters.startDate}
                                        onChange={(date) =>
                                            setFilters({
                                                ...filters,
                                                startDate: date,
                                            })
                                        }
                                        placeholder="Select"
                                    />
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="flex items-center gap-2 min-w-fit h-9">
                                <label className="text-xs text-gray-600 mt-[4px] whitespace-nowrap">
                                    End Date
                                </label>

                                <div className="w-[160px] h-9">
                                    <DatePicker
                                        value={filters.endDate}
                                        onChange={(date) =>
                                            setFilters({
                                                ...filters,
                                                endDate: date,
                                            })
                                        }
                                        placeholder="Select"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="flex items-center gap-2 min-w-fit h-9">
                                <label className="text-xs text-gray-600 mt-[4px] whitespace-nowrap">
                                    Department
                                </label>

                                <Select
                                    value={filters.department}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            department: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-[160px] h-9">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="bar">Bar</SelectItem>
                                        <SelectItem value="kitchen">
                                            Kitchen
                                        </SelectItem>
                                        <SelectItem value="restaurant">
                                            Restaurant
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Category */}
                            <div className="flex items-center gap-2 min-w-fit h-9">
                                <label className="text-xs text-gray-600 mt-[4px] whitespace-nowrap">
                                    Category
                                </label>

                                <Select
                                    value={filters.category}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            category: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-[160px] h-9">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="beverages">
                                            Beverages
                                        </SelectItem>
                                        <SelectItem value="food">
                                            Food
                                        </SelectItem>
                                        <SelectItem value="alcohol">
                                            Alcohol
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedReportLabel}
                            </h3>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </Button>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Showing {getRecordCount(reportData?.data)} record(s)
                            {filters.startDate &&
                                filters.endDate &&
                                ` \u2022 Date Range: ${filters.startDate} to ${filters.endDate}`}
                        </div>
                    </div>
                    <div className="p-6">
                        {reportData.loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-gray-500">
                                    Loading report data...
                                </div>
                            </div>
                        ) : reportData.error ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-red-500">
                                    Failed to load report data:{' '}
                                    {reportData.error?.message ||
                                        String(reportData.error)}
                                </div>
                            </div>
                        ) : getRecordCount(reportData?.data) === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-sm text-gray-500">
                                    No data available for the selected criteria
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {columns.map(
                                                    (column, index) => (
                                                        <th
                                                            key={index}
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                        >
                                                            {column}
                                                        </th>
                                                    ),
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {getReportDataArray(
                                                reportData?.data,
                                            )
                                                .slice(
                                                    (currentPage - 1) *
                                                        itemsPerPage,
                                                    currentPage * itemsPerPage,
                                                )
                                                .map(
                                                    (
                                                        item: unknown,
                                                        index: number,
                                                    ) => (
                                                        <tr key={index}>
                                                            {columns.map(
                                                                (
                                                                    column,
                                                                    colIndex,
                                                                ) => (
                                                                    <td
                                                                        key={
                                                                            colIndex
                                                                        }
                                                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                                    >
                                                                        {renderTableCell(
                                                                            item,
                                                                            column,
                                                                        )}
                                                                    </td>
                                                                ),
                                                            )}
                                                        </tr>
                                                    ),
                                                )}
                                        </tbody>
                                    </table>
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={Math.ceil(
                                        getRecordCount(reportData?.data) /
                                            itemsPerPage,
                                    )}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={getRecordCount(
                                        reportData?.data,
                                    )}
                                    onItemsPerPageChange={setItemsPerPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </PageWrapper>
        </div>
    );
};

export default ReportsPage;
