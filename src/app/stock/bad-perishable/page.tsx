'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { MoreVertical, Search, Printer, CheckCircle, XCircle } from 'lucide-react';
import CustomTable from '@/components/stock/tables/CustomTable';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import CustomDialog from '@/components/common/CustomDialog';
import LogBadStockForm from '@/components/stock/Form/LogBadStockForm';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import useSWR, { mutate } from 'swr';
import {
    getBadStockRecords,
    createBadStockRecord,
    approveBadStockRecord,
} from '@/app/actions/stock';
import { format } from 'date-fns';
import { OTPInput } from '@/components/front-of-house/tables/OTPInput';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHotelServicesContext } from '@/context/HotelServicesContext';

const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

const formatSpoilageReason = (record: any) =>
    record?.reason === 'OTHER' && record?.reasonOther
        ? `OTHER — ${record.reasonOther}`
        : record?.reason || '—';

const printSpoilageTransaction = (record: any) => {
    if (!record) return;
    const lines = Array.isArray(record.items) ? record.items : [];
    const rows = lines
        .map((line: any, index: number) => {
            const quantity = Number(line.quantityAffected) || 0;
            const value = Number(line.valueLost) || 0;
            const unitCost = quantity > 0 ? value / quantity : 0;
            return `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(line.item?.name || 'Item')}</td>
        <td>${escapeHtml(line.item?.itemNumber || '—')}</td>
        <td class="num">${quantity.toLocaleString()} ${escapeHtml(line.unit || '')}</td>
        <td class="num">₦${unitCost.toLocaleString(undefined, {
            maximumFractionDigits: 2,
        })}</td>
        <td class="num">₦${value.toLocaleString()}</td>
      </tr>`;
        })
        .join('');
    const reference = record.transactionNumber || `#${record.id}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Spoilage ${escapeHtml(reference)}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin-bottom: 2px; }
    h2 { font-size: 13px; font-weight: normal; color: #555; margin: 0 0 16px; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 12px; margin-bottom: 16px; }
    .meta span { color: #555; }
    .meta b { color: #111; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; }
    .num { text-align: right; }
    .total { margin-top: 12px; font-weight: bold; text-align: right; font-size: 13px; }
    .notes { margin-top: 16px; font-size: 12px; color: #555; }
    .sign { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; font-size: 12px; }
    .sign div { border-top: 1px solid #999; padding-top: 4px; }
  </style>
</head>
<body>
  <h1>Spoilage Transaction ${escapeHtml(reference)}</h1>
  <h2>Bad Stock &amp; Spoilage Register</h2>
  <div class="meta">
    <p><span>Date:</span> <b>${record.date ? format(new Date(record.date), 'dd MMM yyyy') : '—'}</b></p>
    <p><span>Department:</span> <b>${escapeHtml(record.department || '—')}</b></p>
    <p><span>Reason:</span> <b>${escapeHtml(formatSpoilageReason(record))}</b></p>
    <p><span>Status:</span> <b>${escapeHtml(record.status || '—')}</b></p>
    <p><span>Discovered by:</span> <b>${escapeHtml(record.discoveredBy?.fullName || '—')}</b></p>
    <p><span>Approved by:</span> <b>${escapeHtml(record.approvedBy?.fullName || '—')}</b></p>
    <p><span>Approved at:</span> <b>${
        record.approvedAt
            ? format(new Date(record.approvedAt), 'dd MMM yyyy HH:mm')
            : '—'
    }</b></p>
    <p><span>Items:</span> <b>${record.itemCount || lines.length || 1}</b></p>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Item</th><th>Item No.</th>
        <th class="num">Qty affected</th><th class="num">Unit cost</th><th class="num">Value lost</th>
      </tr>
    </thead>
    <tbody>${rows || '<tr><td colspan="6">No line items</td></tr>'}</tbody>
  </table>
  <div class="total">Total value lost: ₦${Number(record.valueLost || 0).toLocaleString()}</div>
  ${record.remarks ? `<div class="notes"><b>Remarks:</b> ${escapeHtml(record.remarks)}</div>` : ''}
  ${
      record.rejectionReason
          ? `<div class="notes"><b>Rejection reason:</b> ${escapeHtml(record.rejectionReason)}</div>`
          : ''
  }
  <div class="sign">
    <div>Store Officer</div>
    <div>Approving Manager</div>
  </div>
</body>
</html>`;
    const w = window.open('', '_blank', 'noopener,noreferrer,width=800,height=600');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
};

/**
 * An approved write-off changes item balances and the Daily Stock Movement
 * Register, so those caches are refreshed alongside the spoilage list.
 */
const refreshInventoryViews = () => {
    mutate('/items/bad-stock');
    mutate('/items');
    mutate('daily-registers');
    mutate(
        (key) => typeof key === 'string' && key.startsWith('daily-register-'),
    );
};

const BadPerishablePage = () => {
    const { data: recordsResponse, isLoading: isRecordsLoading } = useSWR(
        '/items/bad-stock',
        () => getBadStockRecords(),
    );
    const records = useMemo(
        () => recordsResponse?.data?.data || [],
        [recordsResponse?.data?.data],
    );
    const { hotelServices } = useHotelServicesContext();

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [approvePin, setApprovePin] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const departments = useMemo(() => {
        const fromRecords = records
            .map((r: any) => r.department)
            .filter(Boolean);
        const fromServices = hotelServices.map((s: any) => s.value);
        return Array.from(new Set([...fromServices, ...fromRecords])).sort();
    }, [records, hotelServices]);

    const filteredRecords = records.filter((r: any) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        if (
            departmentFilter !== 'all' &&
            String(r.department || '').toLowerCase() !==
                departmentFilter.toLowerCase()
        ) {
            return false;
        }
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (
            r.transactionNumber?.toLowerCase().includes(q) ||
            r.item?.name?.toLowerCase().includes(q) ||
            r.items?.some((line: any) =>
                line.item?.name?.toLowerCase().includes(q),
            ) ||
            r.department?.toLowerCase().includes(q) ||
            r.reason?.toLowerCase().includes(q)
        );
    });

    const metrics = {
        totalValueLost: records
            .filter((r: any) => r.status === 'APPROVED')
            .reduce((acc: number, r: any) => acc + Number(r.valueLost || 0), 0),
        totalRecords: records.length,
        pendingApproval: records.filter((r: any) => r.status === 'PENDING')
            .length,
        approved: records.filter((r: any) => r.status === 'APPROVED').length,
    };

    const columns = [
        {
            header: 'Txn No.',
            accessorKey: 'transactionNumber',
            cell: ({ row }: any) =>
                row.original.transactionNumber || `#${row.original.id}`,
        },
        {
            header: 'Date',
            accessorKey: 'date',
            cell: ({ row }: any) =>
                format(new Date(row.original.date), 'dd MMM yyyy'),
        },
        {
            header: 'Items',
            accessorKey: 'itemCount',
            cell: ({ row }: any) => {
                const count = row.original.itemCount || 1;
                const name = row.original.item?.name;
                return count > 1 ? `${count} items` : name || 'Unknown';
            },
        },
        { header: 'Department', accessorKey: 'department' },
        {
            header: 'Qty Affected',
            accessorKey: 'quantityAffected',
            cell: ({ row }: any) => row.original.quantityAffected ?? '—',
        },
        {
            header: 'Value Lost (₦)',
            accessorKey: 'valueLost',
            cell: ({ row }: any) => (
                <span className="font-medium text-foreground">
                    ₦{Number(row.original.valueLost || 0).toLocaleString()}
                </span>
            ),
        },
        {
            header: 'Reason',
            accessorKey: 'reason',
            cell: ({ row }: any) => formatSpoilageReason(row.original),
        },
        {
            header: 'Discovered By',
            accessorKey: 'discoveredBy.fullName',
            cell: ({ row }: any) =>
                row.original.discoveredBy?.fullName || 'N/A',
        },
        {
            header: 'Approved By',
            accessorKey: 'approvedBy.fullName',
            cell: ({ row }: any) => row.original.approvedBy?.fullName || '---',
        },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }: any) => (
                <Badge
                    className={cn(
                        'border-none rounded-md px-3 py-1 font-bold italic text-[9px] uppercase tracking-wider',
                        row.original.status === 'APPROVED'
                            ? 'bg-green-50 text-green-600 hover:bg-green-50 shadow-none'
                            : row.original.status === 'PENDING'
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-50 shadow-none'
                              : row.original.status === 'REJECTED'
                                ? 'bg-red-50 text-red-600 hover:bg-red-50 shadow-none'
                                : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-50 shadow-none',
                    )}
                >
                    {row.original.status}
                </Badge>
            ),
        },
        {
            header: 'Action',
            accessorKey: 'action',
            cell: ({ row }: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-gray-100 rounded-full"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-lg border-gray-100 shadow-xl overflow-hidden p-1"
                    >
                        {row.original.status === 'PENDING' && (
                            <>
                                <DropdownMenuItem
                                    className="h-10 rounded-lg font-medium cursor-pointer"
                                    onClick={() => {
                                        setSelectedRecord(row.original);
                                        setIsApproveModalOpen(true);
                                    }}
                                >
                                    Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="h-10 rounded-lg font-medium text-red-600 cursor-pointer"
                                    onClick={() => {
                                        setSelectedRecord(row.original);
                                        setIsRejectModalOpen(true);
                                    }}
                                >
                                    Reject
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuItem
                            className="h-10 rounded-lg font-medium cursor-pointer"
                            onClick={() => {
                                setSelectedRecord(row.original);
                                setIsViewOpen(true);
                            }}
                        >
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="h-10 rounded-lg font-medium cursor-pointer"
                            onClick={() =>
                                printSpoilageTransaction(row.original)
                            }
                        >
                            Print
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleLogSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            const items: { itemId: number; quantityAffected: number }[] =
                Array.isArray(data.items) && data.items.length
                    ? data.items.map(
                          (line: { itemId: number; quantity: number }) => ({
                              itemId: Number(line.itemId),
                              quantityAffected: Number(line.quantity),
                          }),
                      )
                    : [
                          {
                              itemId: Number(data.itemId),
                              quantityAffected: Number(data.quantity),
                          },
                      ];

            const dateStr = data.date
                ? format(data.date, 'yyyy-MM-dd')
                : format(new Date(), 'yyyy-MM-dd');

            const response = await createBadStockRecord({
                date: dateStr,
                department: data.department,
                reason: data.reason?.toUpperCase(),
                reasonOther: data.reasonOther || undefined,
                remarks: data.remarks,
                discoveredBy: data.discoveredBy
                    ? Number(data.discoveredBy)
                    : undefined,
                managerPin: data.managerPin || undefined,
                items,
            });

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.error}
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={
                            data.managerPin
                                ? `Spoilage transaction (${items.length} item(s)) approved and inventory updated.`
                                : `Spoilage transaction (${items.length} item(s)) submitted for approval.`
                        }
                        type="success"
                    />
                ));
                refreshInventoryViews();
                setIsLogModalOpen(false);
            }
            setIsSubmitting(false);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to submit record."
                    type="error"
                />
            ));
        }
    };

    const handleApprove = async () => {
        if (!selectedRecord) return;
        if (approvePin.length !== 4) {
            toast.custom(() => (
                <Toast
                    title="PIN required"
                    description="Enter a valid 4-digit manager PIN to approve."
                    type="error"
                />
            ));
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await approveBadStockRecord(selectedRecord.id, {
                approved: true,
                managerPin: approvePin,
            });

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.error}
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Approved!"
                        description="Inventory has been updated successfully."
                        type="success"
                    />
                ));
                refreshInventoryViews();
                setIsApproveModalOpen(false);
                setApprovePin('');
            }
            setIsSubmitting(false);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred."
                    type="error"
                />
            ));
        }
    };

    const handleReject = async () => {
        if (!selectedRecord) return;
        if (!rejectionReason.trim()) {
            toast.custom(() => (
                <Toast
                    title="Reason required"
                    description="Enter why this spoilage transaction is being rejected."
                    type="error"
                />
            ));
            return;
        }
        try {
            setIsSubmitting(true);
            const response = await approveBadStockRecord(selectedRecord.id, {
                approved: false,
                rejectionReason: rejectionReason.trim(),
            });

            if (response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.error}
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Rejected!"
                        description="Spoilage record has been rejected successfully."
                        type="success"
                    />
                ));
                mutate('/items/bad-stock');
                setIsRejectModalOpen(false);
                setRejectionReason('');
            }
            setIsSubmitting(false);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred."
                    type="error"
                />
            ));
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            <PageHeader>
                <PageHeadertitle
                    title="Spoilage Tracking"
                    subtitle="History of Stock Movement B&D — write-offs posted from the store ledger."
                />
                <HeaderActions />
            </PageHeader>

            <PageWrapper className="flex-1 overflow-auto pt-3">
                <div className="space-y-6 w-full mx-auto pb-10">
                    {/* Action Header */}
                    <div className="flex items-center justify-between px-0 pt-4">
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">
                                Bad & Perishables Log
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Track all damaged, expired, and wasted items
                                posted from Stock Movement B&amp;D
                            </p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-card p-4 rounded-lg border border-border flex flex-col justify-between min-h-[82px]">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                Total Value Lost (Approved)
                            </p>
                            <p className="text-xl font-semibold text-red-500 mt-1 tabular-nums">
                                ₦{metrics.totalValueLost.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-card p-4 rounded-lg border border-border flex flex-col justify-between min-h-[82px]">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                Total Records
                            </p>
                            <p className="text-xl font-semibold text-foreground mt-1 tabular-nums">
                                {metrics.totalRecords}
                            </p>
                        </div>

                        <div className="bg-card p-4 rounded-lg border border-border flex flex-col justify-between min-h-[82px]">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                Pending Approval
                            </p>
                            <p className="text-xl font-semibold text-orange-500 mt-1 tabular-nums">
                                {metrics.pendingApproval}
                            </p>
                        </div>

                        <div className="bg-card p-4 rounded-lg border border-border flex flex-col justify-between min-h-[82px]">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                                Approved
                            </p>
                            <p className="text-xl font-semibold text-green-500 mt-1 tabular-nums">
                                {metrics.approved}
                            </p>
                        </div>
                    </div>

                    {/* Table Filters & List */}
                    <div className="bg-card rounded-lg border border-border p-4 space-y-4 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <div className="relative w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
                                <Input
                                    placeholder="Search by item, department or reason..."
                                    className="pl-10 h-9 rounded-sm text-sm border-border bg-background"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="h-9 w-[160px] border-border rounded-sm text-sm bg-background">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Status
                                        </SelectItem>
                                        <SelectItem value="PENDING">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="APPROVED">
                                            Approved
                                        </SelectItem>
                                        <SelectItem value="REJECTED">
                                            Rejected
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={departmentFilter}
                                    onValueChange={setDepartmentFilter}
                                >
                                    <SelectTrigger className="h-9 w-[180px] border-border rounded-sm text-sm bg-background">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Departments
                                        </SelectItem>
                                        {departments.map((dept: string) => (
                                            <SelectItem
                                                key={dept}
                                                value={dept}
                                            >
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="overflow-hidden">
                            <CustomTable
                                data={filteredRecords}
                                columns={columns}
                                isPaginated={true}
                                hasHeader={false}
                                isLoading={isRecordsLoading}
                                filters={undefined}
                                variant="none"
                            />
                        </div>
                    </div>
                </div>
            </PageWrapper>

            <CustomDialog
                open={isLogModalOpen}
                onOpenChange={setIsLogModalOpen}
                title="Log Bad Stock / Spoilage"
                description="Record one or more damaged, expired, or wasted items. Approve with Manager PIN to update inventory immediately."
                maxWidth="4xl"
                maxHeight="75vh"
                footerType="none"
                confirmText=""
                onConfirm={() => {}}
                onCancel={() => setIsLogModalOpen(false)}
                isLoading={isSubmitting}
            >
                <div className="mt-4">
                    <LogBadStockForm
                        onCancel={() => setIsLogModalOpen(false)}
                        onSubmit={handleLogSubmit}
                        isLoading={isSubmitting}
                        hideButtons={false}
                    />
                </div>
            </CustomDialog>

            <CustomDialog
                open={isApproveModalOpen}
                onOpenChange={setIsApproveModalOpen}
                title=""
                maxWidth="md"
                confirmText="Approve & Update Inventory"
                cancelText="Cancel"
                onConfirm={handleApprove}
                onCancel={() => setIsApproveModalOpen(false)}
                isLoading={isSubmitting}
            >
                <div className="flex flex-col items-center text-center py-6 px-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-green-100/50 blur-xl rounded-full scale-150 animate-pulse" />
                        <CheckCircle className="w-10 h-10 text-green-500 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                        Approve Spoilage Transaction?
                    </h3>
                    <div className="space-y-4 text-sm text-muted-foreground w-full">
                        <p className="text-left font-bold text-foreground/80">
                            This will:
                        </p>
                        <ul className="text-left space-y-3 list-disc pl-5 font-medium">
                            <li>
                                Deduct inventory for{' '}
                                <span className="text-foreground">
                                    {selectedRecord?.itemCount || 1} item(s)
                                </span>{' '}
                                in transaction{' '}
                                <span className="text-foreground">
                                    {selectedRecord?.transactionNumber ||
                                        `#${selectedRecord?.id}`}
                                </span>
                            </li>
                            <li>
                                Reduce inventory value by{' '}
                                <span className="text-foreground font-bold">
                                    ₦
                                    {Number(
                                        selectedRecord?.valueLost || 0,
                                    ).toLocaleString()}
                                </span>
                            </li>
                            <li>
                                Approve the entire spoilage transaction at once
                            </li>
                        </ul>
                        {Array.isArray(selectedRecord?.items) &&
                        selectedRecord.items.length > 0 ? (
                            <div className="text-left rounded-md border divide-y max-h-40 overflow-y-auto">
                                {selectedRecord.items.map((line: any) => (
                                    <div
                                        key={line.id}
                                        className="px-3 py-2 flex justify-between gap-2 text-xs"
                                    >
                                        <span className="font-medium text-foreground">
                                            {line.item?.name}
                                        </span>
                                        <span>
                                            {line.quantityAffected} {line.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        <div className="text-left pt-2 space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                                Manager PIN{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <OTPInput
                                length={4}
                                value={approvePin}
                                onChange={setApprovePin}
                            />
                            <p className="text-xs text-muted-foreground font-normal">
                                A valid 4-digit manager PIN is required to
                                approve.
                            </p>
                        </div>
                        <p className="text-left mt-2 text-sm text-muted-foreground opacity-70">
                            This action cannot be undone.
                        </p>
                    </div>
                </div>
            </CustomDialog>

            <CustomDialog
                open={isViewOpen}
                onOpenChange={setIsViewOpen}
                title={`Spoilage ${selectedRecord?.transactionNumber || ''}`}
                maxWidth="md"
                confirmText="Close"
                cancelText=""
                onConfirm={() => setIsViewOpen(false)}
                onCancel={() => setIsViewOpen(false)}
            >
                <div className="space-y-3 py-2 text-sm">
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2"
                            onClick={() =>
                                printSpoilageTransaction(selectedRecord)
                            }
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <p>
                            Date:{' '}
                            <span className="text-foreground font-medium">
                                {selectedRecord?.date
                                    ? format(
                                          new Date(selectedRecord.date),
                                          'dd MMM yyyy',
                                      )
                                    : '—'}
                            </span>
                        </p>
                        <p>
                            Department:{' '}
                            <span className="text-foreground font-medium">
                                {selectedRecord?.department}
                            </span>
                        </p>
                        <p>
                            Reason:{' '}
                            <span className="text-foreground font-medium">
                                {formatSpoilageReason(selectedRecord)}
                            </span>
                        </p>
                        <p>
                            Status:{' '}
                            <span className="text-foreground font-medium">
                                {selectedRecord?.status}
                            </span>
                        </p>
                        <p>
                            Discovered by:{' '}
                            <span className="text-foreground font-medium">
                                {selectedRecord?.discoveredBy?.fullName || '—'}
                            </span>
                        </p>
                        <p>
                            Approved by:{' '}
                            <span className="text-foreground font-medium">
                                {selectedRecord?.approvedBy?.fullName || '—'}
                            </span>
                        </p>
                    </div>
                    {selectedRecord?.remarks ? (
                        <p className="text-muted-foreground">
                            Remarks:{' '}
                            <span className="text-foreground">
                                {selectedRecord.remarks}
                            </span>
                        </p>
                    ) : null}
                    {selectedRecord?.rejectionReason ? (
                        <p className="text-muted-foreground">
                            Rejection reason:{' '}
                            <span className="text-red-600">
                                {selectedRecord.rejectionReason}
                            </span>
                        </p>
                    ) : null}
                    <div className="rounded-md border divide-y">
                        {(selectedRecord?.items || []).map((line: any) => (
                            <div
                                key={line.id}
                                className="px-3 py-2.5 flex justify-between gap-3"
                            >
                                <div>
                                    <p className="font-medium">
                                        {line.item?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {line.quantityAffected} {line.unit}
                                    </p>
                                </div>
                                <span className="tabular-nums font-medium">
                                    ₦
                                    {Number(line.valueLost || 0).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between font-semibold pt-1">
                        <span>Total value lost</span>
                        <span>
                            ₦
                            {Number(
                                selectedRecord?.valueLost || 0,
                            ).toLocaleString()}
                        </span>
                    </div>
                </div>
            </CustomDialog>

            <CustomDialog
                open={isRejectModalOpen}
                onOpenChange={setIsRejectModalOpen}
                title=""
                maxWidth="md"
                confirmText="Reject Transaction"
                cancelText="Cancel"
                onConfirm={handleReject}
                onCancel={() => {
                    setIsRejectModalOpen(false);
                    setRejectionReason('');
                }}
                isLoading={isSubmitting}
                confirmDisabled={!rejectionReason.trim()}
            >
                <div className="flex flex-col items-center text-center py-6 px-4">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-red-100/50 blur-xl rounded-full scale-150 animate-pulse" />
                        <XCircle className="w-10 h-10 text-red-500 relative z-10" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                        Reject Spoilage Transaction?
                    </h3>
                    <div className="space-y-4 text-sm text-muted-foreground w-full">
                        <p className="text-center leading-relaxed">
                            This will reject the entire transaction (
                            {selectedRecord?.itemCount || 1} item(s)). No
                            inventory changes will be made.
                        </p>
                        <div className="text-left space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                                Rejection reason{' '}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Explain why this transaction is rejected"
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                            />
                            <p className="text-xs text-muted-foreground font-normal">
                                Stored on the transaction for auditing.
                            </p>
                        </div>
                    </div>
                </div>
            </CustomDialog>
        </div>
    );
};

export default BadPerishablePage;

/**
 Feature Requirement Document (FRD): Bad & Perishables 
1. Feature Title
Bad & Perishables (Spoilage Tracking Module)
2. Purpose
To record, track, and approve all cases of damaged, expired, or wasted items across departments (Store, Bar, Kitchen, Restaurant) and automatically adjust inventory values accordingly.
This ensures accountability, accurate stock valuation, and audit-ready reporting for all losses.
3. Functional Overview
When an item goes bad, breaks, expires, or is wasted during operations:
Staff can log it immediately using a Bad Stock Form.


Each record captures who discovered it, department involved, quantity affected, and value lost.


The log is submitted for approval (by Supervisor or Inventory Manager).


Once approved, the system automatically deducts the affected quantity from inventory and adjusts stock value.


4. Core Functionalities
A. Bad Stock Logging Form
Field
Description
Behaviour
Date
Date of incident
Auto-filled (editable)
Item Name
Select from inventory list
Auto-fills category, cost, and location
Category
Auto-filled
From inventory record
Department / Location
Store / Bar / Kitchen / Restaurant
Dropdown
Quantity Affected
Number or amount of items damaged
Numeric input
Unit (Base)
Auto-filled
From inventory UoM
Reason
Expired / Damaged / Spoiled / Wasted / Other = Type it in
Dropdown
Discovered By
Name of staff on duty
Dropdown (linked to user/staff list)
Value Lost (₦)
Auto-calculated = Cost per Unit × Quantity
Display-only
Remarks
Additional comments or explanation
Optional text area

System Behaviour:
When Saved, record appears in the “Bad & Perishables ” table as Pending Approval. The system sents a request to the admin or manager to appprovide from there their end.


When Approved, system:


Deducts the affected quantity from inventory.


Adjusts total inventory value.


Marks record as Approved and Processed.
B. Bad Stock Log Table (Overview) After it is created
Column
Description
Date
Date of report
Item Name
Damaged or expired item
Department
Where it occurred
Qty Affected
Quantity of loss
Unit
Measurement unit
Value Lost (₦)
Total cost of loss
Reason
Expired / Damaged / Spoiled
Discovered By
Staff name
Approved By
Manager or Supervisor
Status
Pending / Approved / Rejected
Remarks
Notes or cause

🖨 Print Output:
 Each record printable with signature blocks for:
Discovered By


Supervisor Approval


Manager Approval


5. Integration Points
Inventory Module: Deducts lost quantities and updates value.


User/Staff Module: Pulls staff names.


Reports Module: Adds “Losses & Spoilage Report” category.


Audit Trail: Records every action (logged, approved, rejected).
7. Expected Behaviour
Items logged as bad or spoiled are instantly visible in the Bad Stock table.


Only approved entries affect inventory counts and value.


System ensures department and staff accountability for every loss.


Allows tracking by item type, department, and staff member for monthly loss analysis.


8. Example Entries
Date
Item
Category
Dept
Qty
UoM
Value Lost (₦)
Reason
Discovered By
Approved By
Status
Remarks
20-Oct-2025
Tomatoes
Perishables
Kitchen
5
Kg
₦4,000
Spoiled
Mary I.
Chef John
Approved
Rotten overnight
20-Oct-2025
Tequila
Drinks
Bar
1
Bottle
₦12,000
Broken
Samuel A.
Bar Supv.
Approved
Fell from shelf
21-Oct-2025
Eggs
Poultry
Store
2
Crates
₦6,400
Cracked
Chinedu O.
Store Mgr.
Pending
Dropped during offload



 */
