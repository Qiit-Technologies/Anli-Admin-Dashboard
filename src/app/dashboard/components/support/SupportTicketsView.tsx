'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    Inbox,
    Search,
    Send,
    Loader2,
    ChevronLeft,
    ChevronRight,
    MailCheck,
    LifeBuoy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    getSupportTickets,
    getSupportTicket,
    updateTicketStatus,
    replyToTicket,
    type SupportTicket,
    type TicketStatus,
} from '@/app/actions/super-admin-support';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const STATUS_META: Record<TicketStatus, { label: string; className: string }> = {
    open: {
        label: 'Open',
        className:
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
    },
    in_progress: {
        label: 'In Progress',
        className:
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800',
    },
    resolved: {
        label: 'Resolved',
        className:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800',
    },
    closed: {
        label: 'Closed',
        className:
            'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
};

const PRIORITY_META: Record<string, { label: string; className: string }> = {
    low: {
        label: 'Low',
        className:
            'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    medium: {
        label: 'Medium',
        className:
            'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800',
    },
    high: {
        label: 'High',
        className:
            'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800',
    },
    urgent: {
        label: 'Urgent',
        className:
            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800',
    },
};

function StatusBadge({ status }: { status: string }) {
    const meta = STATUS_META[status as TicketStatus];
    return (
        <Badge
            variant="outline"
            className={cn(
                'whitespace-nowrap px-2 py-0.5 text-xs font-medium',
                meta?.className ??
                    'bg-gray-100 text-gray-700 border-gray-200',
            )}
        >
            {meta?.label ?? status}
        </Badge>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const key = (priority || 'low').toLowerCase();
    const meta = PRIORITY_META[key] ?? PRIORITY_META.low;
    return (
        <Badge
            variant="outline"
            className={cn(
                'whitespace-nowrap px-2 py-0.5 text-xs font-medium',
                meta.className,
            )}
        >
            {meta.label}
        </Badge>
    );
}

function formatDate(value?: string) {
    if (!value) return '—';
    try {
        return format(new Date(value), 'dd MMM yyyy, HH:mm');
    } catch {
        return '—';
    }
}

const PAGE_SIZE = 20;

export function SupportTicketsView() {
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | number | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Debounce the search input so we don't hammer the API on every keystroke
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        setPage(1);
        window.clearTimeout((handleSearchChange as any)._t);
        (handleSearchChange as any)._t = window.setTimeout(() => {
            setDebouncedSearch(value.trim());
        }, 400);
    };

    const listKey = useMemo(
        () => [
            'support-tickets',
            statusFilter,
            priorityFilter,
            debouncedSearch,
            page,
        ],
        [statusFilter, priorityFilter, debouncedSearch, page],
    );

    const {
        data: listData,
        isLoading: listLoading,
        error: listError,
        mutate: mutateList,
    } = useSWR(
        listKey,
        () =>
            getSupportTickets({
                status: statusFilter === 'all' ? undefined : statusFilter,
                priority:
                    priorityFilter === 'all' ? undefined : priorityFilter,
                search: debouncedSearch || undefined,
                page,
                limit: PAGE_SIZE,
            }),
        {
            onError: (error) => {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Failed to load support tickets',
                );
            },
        },
    );

    // Lightweight per-status counts for the stat cards (limit 1 → we only need `total`)
    const { data: openCount } = useSWR('support-stats-open', () =>
        getSupportTickets({ status: 'open', page: 1, limit: 1 }).then(
            (r) => r.total ?? 0,
        ),
    );
    const { data: inProgressCount } = useSWR('support-stats-in-progress', () =>
        getSupportTickets({ status: 'in_progress', page: 1, limit: 1 }).then(
            (r) => r.total ?? 0,
        ),
    );
    const { data: resolvedCount } = useSWR('support-stats-resolved', () =>
        getSupportTickets({ status: 'resolved', page: 1, limit: 1 }).then(
            (r) => r.total ?? 0,
        ),
    );

    const tickets: SupportTicket[] = listData?.data ?? [];
    const total = listData?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const openDetail = (ticket: SupportTicket) => {
        setSelectedId(ticket.id);
        setDetailOpen(true);
    };

    const resetFilters = () => {
        setStatusFilter('all');
        setPriorityFilter('all');
        setSearchInput('');
        setDebouncedSearch('');
        setPage(1);
    };

    return (
        <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/40">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Open
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {openCount ?? '—'}
                        </p>
                    </Card>
                    <Card className="border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            In Progress
                        </p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {inProgressCount ?? '—'}
                        </p>
                    </Card>
                    <Card className="border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/40">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Resolved
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {resolvedCount ?? '—'}
                        </p>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                aria-label="Search tickets"
                                placeholder="Search ticket #, subject or hotel…"
                                value={searchInput}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    setStatusFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger
                                    aria-label="Filter by status"
                                    className="w-full sm:w-44"
                                >
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={priorityFilter}
                                onValueChange={(v) => {
                                    setPriorityFilter(v);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger
                                    aria-label="Filter by priority"
                                    className="w-full sm:w-44"
                                >
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {(statusFilter !== 'all' ||
                                priorityFilter !== 'all' ||
                                searchInput) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Tickets table */}
                <Card className="overflow-hidden">
                    {listLoading ? (
                        <div className="space-y-3 p-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-12 w-full"
                                />
                            ))}
                        </div>
                    ) : listError ? (
                        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Couldn&apos;t load support tickets. Please try
                                again.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => mutateList()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
                            <Inbox className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                            <p className="font-medium">No tickets found</p>
                            <p className="max-w-sm text-sm text-muted-foreground">
                                {statusFilter !== 'all' ||
                                priorityFilter !== 'all' ||
                                debouncedSearch
                                    ? 'Try adjusting your filters or search.'
                                    : 'New customer support requests will appear here.'}
                            </p>
                            {(statusFilter !== 'all' ||
                                priorityFilter !== 'all' ||
                                debouncedSearch) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ticket #</TableHead>
                                            <TableHead>Hotel</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="whitespace-nowrap">
                                                Updated
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tickets.map((ticket) => (
                                            <TableRow
                                                key={ticket.id}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    openDetail(ticket)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === 'Enter' ||
                                                        e.key === ' '
                                                    ) {
                                                        e.preventDefault();
                                                        openDetail(ticket);
                                                    }
                                                }}
                                                tabIndex={0}
                                                aria-label={`Open ticket ${ticket.ticketNumber}`}
                                            >
                                                <TableCell className="font-medium text-primary">
                                                    {ticket.ticketNumber}
                                                </TableCell>
                                                <TableCell>
                                                    {ticket.hotelName || '—'}
                                                </TableCell>
                                                <TableCell className="max-w-56 truncate">
                                                    {ticket.subject}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {ticket.category?.replace(
                                                        /_/g,
                                                        ' ',
                                                    ) || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <PriorityBadge
                                                        priority={
                                                            ticket.priority
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        status={ticket.status}
                                                    />
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                                    {formatDate(
                                                        ticket.updatedAt,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination */}
                            <div className="flex items-center justify-between border-t px-4 py-3">
                                <p className="text-sm text-muted-foreground">
                                    Page {page} of {totalPages} · {total}{' '}
                                    ticket{total !== 1 ? 's' : ''}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page <= 1}
                                        onClick={() =>
                                            setPage((p) => Math.max(1, p - 1))
                                        }
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page >= totalPages}
                                        onClick={() =>
                                            setPage((p) =>
                                                Math.min(totalPages, p + 1),
                                            )
                                        }
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>

            <TicketDetailSheet
                ticketId={selectedId}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onChanged={() => mutateList()}
            />
        </div>
    );
}

function TicketDetailSheet({
    ticketId,
    open,
    onOpenChange,
    onChanged,
}: {
    ticketId: string | number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChanged: () => void;
}) {
    const {
        data: ticket,
        isLoading,
        mutate,
    } = useSWR(ticketId && open ? ['support-ticket', ticketId] : null, () =>
        getSupportTicket(ticketId as string | number),
    );

    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(
        null,
    );
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const messages = useMemo(() => ticket?.messages ?? [], [ticket]);

    const handleSendReply = async () => {
        const text = reply.trim();
        if (!text || !ticketId) return;
        setSending(true);
        try {
            await replyToTicket(ticketId, text);
            setReply('');
            toast.success('Reply sent — the customer has been emailed');
            await mutate();
            onChanged();
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to send reply',
            );
        } finally {
            setSending(false);
        }
    };

    const requestStatusChange = (status: TicketStatus) => {
        if (!ticket || status === ticket.status) return;
        setPendingStatus(status);
        setConfirmOpen(true);
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus || !ticketId) return;
        setUpdatingStatus(true);
        try {
            await updateTicketStatus(ticketId, pendingStatus);
            toast.success(`Ticket marked as ${STATUS_META[pendingStatus].label}`);
            setConfirmOpen(false);
            setPendingStatus(null);
            await mutate();
            onChanged();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side="right"
                    className="flex w-full flex-col sm:max-w-xl"
                >
                    <SheetHeader className="text-left">
                        <SheetTitle className="flex items-center gap-2">
                            <LifeBuoy className="h-5 w-5 text-primary" />
                            {ticket ? ticket.ticketNumber : 'Ticket details'}
                        </SheetTitle>
                        <SheetDescription>
                            {ticket
                                ? `${ticket.hotelName || 'Unknown hotel'} · opened ${formatDate(ticket.createdAt)}`
                                : 'Loading ticket…'}
                        </SheetDescription>
                    </SheetHeader>

                    {isLoading || !ticket ? (
                        <div className="flex-1 space-y-3 overflow-hidden py-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col gap-4 py-4">
                            {/* Meta + status changer */}
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={ticket.status} />
                                <PriorityBadge priority={ticket.priority} />
                                <Badge variant="secondary" className="capitalize">
                                    {ticket.category?.replace(/_/g, ' ') ||
                                        'General'}
                                </Badge>
                                <div className="ml-auto flex items-center gap-2">
                                    <label
                                        htmlFor="ticket-status"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Status
                                    </label>
                                    <Select
                                        value={ticket.status}
                                        onValueChange={(v) =>
                                            requestStatusChange(
                                                v as TicketStatus,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id="ticket-status"
                                            aria-label="Change ticket status"
                                            className="w-36"
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(
                                                Object.keys(
                                                    STATUS_META,
                                                ) as TicketStatus[]
                                            ).map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {STATUS_META[s].label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Subject + description */}
                            <div className="rounded-lg border bg-muted/40 p-4">
                                <p className="font-semibold">{ticket.subject}</p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                                    {ticket.description}
                                </p>
                                <p className="mt-3 text-xs text-muted-foreground">
                                    Raised by {ticket.createdByName} (
                                    {ticket.createdByEmail})
                                </p>
                            </div>

                            {/* Message thread */}
                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border p-4">
                                {messages.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        No messages yet — be the first to reply.
                                    </p>
                                )}
                                {messages.map((m) => {
                                    const isAdmin =
                                        m.senderType === 'super_admin';
                                    return (
                                        <div
                                            key={m.id}
                                            className={cn(
                                                'flex',
                                                isAdmin
                                                    ? 'justify-end'
                                                    : 'justify-start',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'max-w-[85%] rounded-2xl px-4 py-2.5',
                                                    isAdmin
                                                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                                                        : 'rounded-bl-sm bg-muted',
                                                )}
                                            >
                                                <p className="mb-1 text-[11px] font-semibold opacity-80">
                                                    {isAdmin
                                                        ? `You${m.senderName ? ` · ${m.senderName}` : ''}`
                                                        : m.senderName ||
                                                          'Hotel staff'}
                                                </p>
                                                <p className="whitespace-pre-wrap text-sm">
                                                    {m.message}
                                                </p>
                                                <p
                                                    className={cn(
                                                        'mt-1 text-[11px] opacity-70',
                                                    )}
                                                >
                                                    {formatDate(m.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Reply box */}
                            <div className="space-y-2 border-t pt-4">
                                <label
                                    htmlFor="ticket-reply"
                                    className="text-sm font-medium"
                                >
                                    Reply as support
                                </label>
                                <Textarea
                                    id="ticket-reply"
                                    placeholder="Write your reply to the customer…"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    rows={3}
                                    disabled={sending}
                                />
                                <div className="flex items-center justify-between gap-2">
                                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MailCheck className="h-3.5 w-3.5" />
                                        The customer is emailed automatically
                                        on reply.
                                    </p>
                                    <Button
                                        onClick={handleSendReply}
                                        disabled={sending || !reply.trim()}
                                        size="sm"
                                    >
                                        {sending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="mr-2 h-4 w-4" />
                                        )}
                                        Send reply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Status change confirmation */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Change ticket status?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingStatus &&
                                `This will mark ticket ${ticket?.ticketNumber ?? ''} as "${STATUS_META[pendingStatus].label}".`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={updatingStatus}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            disabled={updatingStatus}
                        >
                            {updatingStatus ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
