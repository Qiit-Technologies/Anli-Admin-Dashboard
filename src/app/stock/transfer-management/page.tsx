'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { transferColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus, Search, Download, ChevronDown } from 'lucide-react';
import useSWR from 'swr';
import {
    getTransfers,
    approveTransfer,
    rejectTransfer,
} from '@/app/actions/stock';
import { Card } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StockTransfer } from './types';
import { TRANSFER_STAT_HREFS } from '@/components/stock/common/cards/Dashboard';

const StockTransferMgtPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const statusFilter = searchParams.get('status');
    const [selectedTransfer, setSelectedTransfer] =
        useState<StockTransfer | null>(null);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: transfersResponse, mutate: mutateTransfers } = useSWR(
        '/items/transfers',
        getTransfers,
    );

    const allData = transfersResponse?.data.data || [];
    const stats = transfersResponse?.data.stats || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    };

    const data = useMemo(() => {
        if (!statusFilter || statusFilter === 'all') return allData;
        return allData.filter(
            (row: StockTransfer) =>
                String(row.status).toUpperCase() ===
                statusFilter.toUpperCase(),
        );
    }, [allData, statusFilter]);

    const handleApprove = async () => {
        if (!selectedTransfer) return;

        setIsProcessing(true);
        try {
            const result = await approveTransfer(selectedTransfer.id);
            if (result.error) {
                console.error('Failed to approve transfer:', result.error);
            } else {
                setShowApproveDialog(false);
                setSelectedTransfer(null);
                mutateTransfers(); // Refresh data
            }
        } catch (error: any) {
            console.error('Error approving transfer:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedTransfer || !rejectionReason.trim()) return;

        setIsProcessing(true);
        try {
            const result = await rejectTransfer(
                selectedTransfer.id,
                rejectionReason,
            );
            if (result.error) {
                console.error('Failed to reject transfer:', result.error);
            } else {
                setShowRejectDialog(false);
                setSelectedTransfer(null);
                setRejectionReason('');
                mutateTransfers(); // Refresh data
            }
        } catch (error: any) {
            console.error('Error rejecting transfer:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const openApproveDialog = (transfer: StockTransfer) => {
        setSelectedTransfer(transfer);
        setShowApproveDialog(true);
    };

    const openRejectDialog = (transfer: StockTransfer) => {
        setSelectedTransfer(transfer);
        setShowRejectDialog(true);
    };

    const handlePrint = (transfer: StockTransfer) => {
        // Create a printable version of the transfer details
        const printContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
                <h1 style="text-align: center; margin-bottom: 30px;">Stock Transfer Details</h1>
                
                <div style="margin-bottom: 20px;">
                    <strong>Transfer ID:</strong> ${transfer.transferId}<br>
                    <strong>Date:</strong> ${new Date(transfer.transferDate).toLocaleDateString()}<br>
                    <strong>Type:</strong> ${transfer.transferType === 'INTER' ? 'Inter-department' : 'Intra-department'}<br>
                    <strong>Status:</strong> ${transfer.status?.toLowerCase()}<br>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <strong>From:</strong> ${transfer.fromDepartment}<br>
                    ${transfer.fromSubUnit ? `<strong>From Sub-unit:</strong> ${transfer.fromSubUnit}<br>` : ''}
                    <strong>To:</strong> ${transfer.toDepartment}<br>
                    ${transfer.toSubUnit ? `<strong>To Sub-unit:</strong> ${transfer.toSubUnit}<br>` : ''}
                </div>
                
                <div style="margin-bottom: 20px;">
                    <strong>Transferred By:</strong> ${transfer.transferredBy?.fullName || 'N/A'}<br>
                    ${transfer.receivedBy ? `<strong>Received By:</strong> ${transfer.receivedBy.fullName}<br>` : ''}
                    ${transfer.approvedBy ? `<strong>Approved By:</strong> ${transfer.approvedBy.fullName}<br>` : ''}
                    ${transfer.approvedAt ? `<strong>Approved At:</strong> ${new Date(transfer.approvedAt).toLocaleDateString()}<br>` : ''}
                </div>
                
                <h3 style="margin-bottom: 15px;">Items</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f5f5f5;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item Name</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Quantity</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unit</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unit Cost</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Total Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transfer.items
                            .map(
                                (item) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${item.item?.name || 'Unknown'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${item.unit}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${item.unitCost?.toFixed(2) || '0.00'}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${item.totalValue?.toFixed(2) || '0.00'}</td>
                            </tr>
                        `,
                            )
                            .join('')}
                    </tbody>
                </table>
                
                <div style="margin-bottom: 20px;">
                    <strong>Total Value:</strong> ${transfer.totalValue?.toFixed(2) || '0.00'}
                </div>
                
                ${
                    transfer.remarks
                        ? `
                    <div style="margin-bottom: 20px;">
                        <strong>Remarks:</strong> ${transfer.remarks}
                    </div>
                `
                        : ''
                }
                
                ${
                    transfer.rejectionReason
                        ? `
                    <div style="margin-bottom: 20px;">
                        <strong>Rejection Reason:</strong> ${transfer.rejectionReason}
                    </div>
                `
                        : ''
                }
                
                <div style="margin-top: 30px; font-size: 12px; color: #666;">
                    <p>Printed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        `;

        // Create a new window and print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Stock Transfer - ${transfer.transferId}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Transfer Management"
                    subtitle="Manage inter and intra-departmental stock transfers with complete audit trail"
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-2">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold text-foreground">
                                Stock Transfer Records
                            </h2>
                            <p className="text-xs text-muted-foreground italic">
                                Add, edit, or remove inventory items
                            </p>
                        </div>
                        <Button
                            onClick={() =>
                                router.push('/stock/transfer-management/create')
                            }
                            className="bg-orion-blue hover:bg-orion-blue/90 flex items-center gap-2 rounded-md h-11 px-6 shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            New Transfer
                        </Button>
                    </div>

                    {statusFilter ? (
                        <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm">
                            <span>
                                Filtered by status:{' '}
                                <strong>{statusFilter}</strong>
                            </span>
                            <Link
                                href="/stock/transfer-management"
                                className="text-orion-blue hover:underline"
                            >
                                Back to all transfers
                            </Link>
                        </div>
                    ) : null}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        {(
                            [
                                {
                                    title: 'Total Transfers',
                                    value: stats.total,
                                    className: 'text-foreground',
                                },
                                {
                                    title: 'Pending',
                                    value: stats.pending,
                                    className: 'text-orange-500',
                                },
                                {
                                    title: 'Approved',
                                    value: stats.approved,
                                    className: 'text-green-500',
                                },
                                {
                                    title: 'Rejected',
                                    value: stats.rejected,
                                    className: 'text-red-500',
                                },
                            ] as const
                        ).map((card) => (
                            <Link
                                key={card.title}
                                href={TRANSFER_STAT_HREFS[card.title]}
                                className="block"
                            >
                                <Card className="p-5 border-gray-100 flex flex-col justify-between h-20 bg-white hover:border-orion-blue/40 transition-colors cursor-pointer">
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                        {card.title}
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${card.className}`}
                                    >
                                        {card.value}
                                    </p>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Filters and Table */}
                    <Card className="border-gray-100 p-6 overflow-hidden space-y-6 bg-white rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search"
                                    className="pl-10 h-11 border-gray-200 bg-gray-50/30 focus:bg-white focus:ring-1 focus:ring-orion-blue/20 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-11 border-gray-200 font-medium gap-2 text-sm px-4"
                                >
                                    All Status{' '}
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-11 border-gray-200 font-medium gap-2 text-sm px-4"
                                >
                                    All Types{' '}
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>

                        <CustomTable
                            data={data}
                            columns={transferColumns}
                            isPaginated={true}
                            hasHeader={false}
                            filters={undefined}
                            title="Transfer Management"
                            meta={{
                                actionHandlers: {
                                    onApprove: openApproveDialog,
                                    onReject: openRejectDialog,
                                    onPrint: handlePrint,
                                },
                            }}
                        />
                    </Card>
                </div>
            </PageWrapper>

            {/* Approve Confirmation Dialog */}
            <Dialog
                open={showApproveDialog}
                onOpenChange={setShowApproveDialog}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Approve Stock Transfer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this stock
                            transfer? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedTransfer && (
                            <div className="space-y-2 text-sm">
                                <p>
                                    <strong>Transfer ID:</strong>{' '}
                                    {selectedTransfer.transferId}
                                </p>
                                <p>
                                    <strong>From:</strong>{' '}
                                    {selectedTransfer.fromDepartment}
                                </p>
                                <p>
                                    <strong>To:</strong>{' '}
                                    {selectedTransfer.toDepartment}
                                </p>
                                <p>
                                    <strong>Items:</strong>{' '}
                                    {selectedTransfer.items.length} items
                                </p>
                                <p>
                                    <strong>Total Value:</strong>{' '}
                                    {selectedTransfer.totalValue}
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowApproveDialog(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {isProcessing ? 'Approving...' : 'Approve Transfer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog with Reason */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reject Stock Transfer</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this stock
                            transfer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        {selectedTransfer && (
                            <div className="space-y-2 text-sm">
                                <p>
                                    <strong>Transfer ID:</strong>{' '}
                                    {selectedTransfer.transferId}
                                </p>
                                <p>
                                    <strong>From:</strong>{' '}
                                    {selectedTransfer.fromDepartment}
                                </p>
                                <p>
                                    <strong>To:</strong>{' '}
                                    {selectedTransfer.toDepartment}
                                </p>
                                <p>
                                    <strong>Items:</strong>{' '}
                                    {selectedTransfer.items.length} items
                                </p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <label
                                htmlFor="rejection-reason"
                                className="text-sm font-medium"
                            >
                                Rejection Reason *
                            </label>
                            <Textarea
                                id="rejection-reason"
                                placeholder="Enter the reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectionReason('');
                            }}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={isProcessing || !rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isProcessing ? 'Rejecting...' : 'Reject Transfer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default StockTransferMgtPage;
