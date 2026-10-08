'use client';
import BrandButton from '@/components/common/Button';
import { MultiSelectAlternative } from '@/components/common/MultiSelectAlternative';
import {
    BadgeCheck,
    Info,
    X,
    Play,
    History,
    Save,
    RotateCcw,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { fetchRooms } from '@/hooks/fetcher';

import type { ROOM } from '@/types';
import toast from 'react-hot-toast';
import {
    applyAutobillingToAll,
    applyAutobillingToRooms,
    revertAutobillingToRooms,
    revertAutobillingAll,
    getRevertableAutobillingGuests,
    getAutoBillingLogs,
    getAutoBillingSettings,
    runAutomaticAutobilling,
    updateAutoBillingSettings,
    type AutoBillingLogEntry,
} from '@/app/actions/autobilling';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Room = {
    id: number;
    name: string;
};

type PendingAction = 'individual' | 'multiple' | 'all' | null;

// Fetch rooms via useSWR instead of mock data
const useRoomOptions = () => {
    const { data, isLoading, error } = useSWR<ROOM[]>(
        '/hotelRooms',
        fetchRooms,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            fallbackData: [],
        },
    );
    const rooms: Room[] = Array.isArray(data)
        ? data
            .filter((r) => r.isOccupied || r.isBooked)
            .map((r) => ({
                id: r.id,
                name: `${r?.guests?.[0]?.fullName ?? 'Guest'} - Room ${r.roomNumber} `,
            }))
        : [];
    return { rooms, isLoading, error, rawData: data };
};

// Fetch revertable guests who have active un-reverted auto-billing charges
const fetchRevertableGuests = async () => {
    const res = await getRevertableAutobillingGuests();
    return res.data || [];
};

const useRevertRoomOptions = () => {
    const { data, isLoading } = useSWR(
        '/revertableAutobillingGuests',
        fetchRevertableGuests,
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
            fallbackData: [],
        },
    );
    const rooms: Room[] = Array.isArray(data)
        ? data.map((g) => ({
            id: g.id,
            name: `${g.fullName} - Room ${g.roomNumber} (${g.unrevertedCount} night(s) auto-billed)`,
        }))
        : [];
    return { rooms, isLoading };
};

// Ensure selected rooms remain unique by id
const dedupeRoomsById = (rooms: Room[]) => {
    const seen = new Set<number>();
    return rooms.filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
    });
};
// Ensure selected room ids remain unique (InviteModal pattern)
const dedupeIds = (ids: string[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const id of ids) {
        if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
        }
    }
    return out;
};

export const AutoBillingCard = () => {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
    const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);
    const [submitting, setSubmitting] = useState(false);

    // Revert section state
    const [showRevertConfirmDialog, setShowRevertConfirmDialog] =
        useState(false);
    const [selectedRevertRooms, setSelectedRevertRooms] = useState<Room[]>([]);
    const [selectedRevertRoomIds, setSelectedRevertRoomIds] = useState<
        string[]
    >([]);
    const [pendingRevertAction, setPendingRevertAction] =
        useState<PendingAction>(null);
    const [reverting, setReverting] = useState(false);
    const [showRevertSuccess, setShowRevertSuccess] = useState(false);

    const [autoBillingEnabled, setAutoBillingEnabled] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [saveCooldown, setSaveCooldown] = useState(false);
    const [logs, setLogs] = useState<AutoBillingLogEntry[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [runningAuto, setRunningAuto] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AutoBillingLogEntry | null>(
        null,
    );
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [runResult, setRunResult] = useState<AutoBillingLogEntry | null>(
        null,
    );
    const [showRunResultDialog, setShowRunResultDialog] = useState(false);

    const { rooms, isLoading } = useRoomOptions();
    const selectedResolved: Room[] = selectedRoomIds
        .map((id) => rooms.find((r) => r.id.toString() === id))
        .filter(Boolean) as Room[];

    const { rooms: revertRooms, isLoading: revertRoomsLoading } =
        useRevertRoomOptions();
    const selectedRevertResolved: Room[] = selectedRevertRoomIds
        .map((id) => revertRooms.find((r) => r.id.toString() === id))
        .filter(Boolean) as Room[];

    const occupiedOrBookedCount = useMemo(() => rooms.length, [rooms]);

    useEffect(() => {
        const loadSettings = async () => {
            const res = await getAutoBillingSettings();
            if (res.data) {
                setAutoBillingEnabled(res.data.autoBillingEnabled);
            }
        };
        loadSettings();
    }, []);

    const loadLogs = async () => {
        setLoadingLogs(true);
        const res = await getAutoBillingLogs(20);
        if (res.data) {
            setLogs(res.data);
        }
        setLoadingLogs(false);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const handleAutoBillIndividual = async () => {
        if (selectedRooms.length !== 1) return;
        try {
            setSubmitting(true);
            const room = selectedRooms[0];
            const result = await applyAutobillingToRooms([room.id], 1);
            if (result.error) {
                toast.error(result.error);
                setShowSuccessMessage(false);
            } else {
                toast.success(result.message || 'Autobilling applied');
                setShowSuccessMessage(true);
                setSelectedRooms([]);
                setSelectedRoomIds([]);
                void globalMutate('/hotelRooms');
                void globalMutate('/checkedInGuests');
                void globalMutate('/hotelGuests');
                void globalMutate('/revertableAutobillingGuests');
                void globalMutate(
                    (key) => typeof key === 'string' && key.includes('guest'),
                );
                void loadLogs();
            }
        } finally {
            setSubmitting(false);
            setShowConfirmationDialog(false);
        }
    };

    const handleAutoBillMultiple = async () => {
        if (selectedRooms.length < 2) return;
        try {
            setSubmitting(true);
            const roomIds = selectedRooms.map((r) => r.id);
            const result = await applyAutobillingToRooms(roomIds, 1);
            if (result.error) {
                toast.error(result.error);
                setShowSuccessMessage(false);
            } else {
                toast.success(
                    result.message ||
                    `Autobilling applied to ${roomIds.length} room(s)`,
                );
                setShowSuccessMessage(true);
                setSelectedRooms([]);
                setSelectedRoomIds([]);
                void globalMutate('/hotelRooms');
                void globalMutate('/checkedInGuests');
                void globalMutate('/hotelGuests');
                void globalMutate('/revertableAutobillingGuests');
                void globalMutate(
                    (key) => typeof key === 'string' && key.includes('guest'),
                );
                void loadLogs();
            }
        } finally {
            setSubmitting(false);
            setShowConfirmationDialog(false);
        }
    };

    const handleAutoBillAllRooms = async () => {
        try {
            setSubmitting(true);
            const result = await applyAutobillingToAll(1);
            if (result.error) {
                toast.error(result.error);
                setShowSuccessMessage(false);
            } else {
                toast.success(result.message || 'Autobilling applied to all');
                setShowSuccessMessage(true);
                setSelectedRooms([]);
                setSelectedRoomIds([]);
                void globalMutate('/hotelRooms');
                void globalMutate('/checkedInGuests');
                void globalMutate('/hotelGuests');
                void globalMutate('/revertableAutobillingGuests');
                void globalMutate(
                    (key) => typeof key === 'string' && key.includes('guest'),
                );
                void loadLogs();
            }
        } finally {
            setSubmitting(false);
            setShowConfirmationDialog(false);
        }
    };

    const openConfirmation = (action: PendingAction) => {
        if (action === 'individual' && selectedRooms.length !== 1) {
            console.warn('Select exactly one room for individual autobilling');
            return;
        }
        if (action === 'multiple' && selectedRooms.length < 2) {
            console.warn('Select two or more rooms for multiple autobilling');
            return;
        }
        setPendingAction(action);
        setShowConfirmationDialog(true);
    };

    const applyAutobilling = () => {
        if (selectedRooms.length === 0) {
            openConfirmation('all');
            return;
        }
        if (selectedRooms.length === 1) {
            openConfirmation('individual');
            return;
        }
        openConfirmation('multiple');
    };

    const handleCancelAutobilling = () => {
        setShowConfirmationDialog(false);
        setPendingAction(null);
    };

    // Revert handlers
    const handleRevertIndividual = async () => {
        if (selectedRevertRooms.length !== 1) return;
        try {
            setReverting(true);
            const result = await revertAutobillingToRooms([
                selectedRevertRooms[0].id,
            ]);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(result.message || 'Auto-billing reverted');
                setShowRevertSuccess(true);
                setSelectedRevertRooms([]);
                setSelectedRevertRoomIds([]);
                void globalMutate('/hotelRooms');
                void globalMutate('/checkedInGuests');
                void globalMutate('/hotelGuests');
                void globalMutate('/revertableAutobillingGuests');
                void globalMutate(
                    (key) => typeof key === 'string' && key.includes('guest'),
                );
                void loadLogs();
            }
        } finally {
            setReverting(false);
            setShowRevertConfirmDialog(false);
        }
    };

    const handleRevertMultiple = async () => {
        if (selectedRevertRooms.length < 2) return;
        try {
            setReverting(true);
            const ids = selectedRevertRooms.map((r) => r.id);
            const result = await revertAutobillingToRooms(ids);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(
                    result.message ||
                    `Auto-billing reverted for ${ids.length} room(s)`,
                );
                setShowRevertSuccess(true);
                setSelectedRevertRooms([]);
                setSelectedRevertRoomIds([]);
                void globalMutate('/hotelRooms');
                void globalMutate('/checkedInGuests');
                void globalMutate('/hotelGuests');
                void globalMutate('/revertableAutobillingGuests');
                void globalMutate(
                    (key) => typeof key === 'string' && key.includes('guest'),
                );
                void loadLogs();
            }
        } finally {
            setReverting(false);
            setShowRevertConfirmDialog(false);
        }
    };

    const handleRevertAll = async () => {
        try {
            setReverting(true);
            const result = await revertAutobillingAll();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(
                    result.message || 'Auto-billing reverted for all rooms',
                );
                setShowRevertSuccess(true);
                setSelectedRevertRooms([]);
                setSelectedRevertRoomIds([]);
                void globalMutate('/hotelRooms');
                void globalMutate('/checkedInGuests');
                void globalMutate('/hotelGuests');
                void globalMutate('/revertableAutobillingGuests');
                void globalMutate(
                    (key) => typeof key === 'string' && key.includes('guest'),
                );
                void loadLogs();
            }
        } finally {
            setReverting(false);
            setShowRevertConfirmDialog(false);
        }
    };

    const openRevertConfirmation = (action: PendingAction) => {
        if (action === 'individual' && selectedRevertRooms.length !== 1) return;
        if (action === 'multiple' && selectedRevertRooms.length < 2) return;
        setPendingRevertAction(action);
        setShowRevertConfirmDialog(true);
    };

    const applyRevert = () => {
        if (selectedRevertRooms.length === 0) {
            openRevertConfirmation('all');
            return;
        }
        if (selectedRevertRooms.length === 1) {
            openRevertConfirmation('individual');
            return;
        }
        openRevertConfirmation('multiple');
    };

    const handleToggleAutoBilling = (checked: boolean) => {
        setAutoBillingEnabled(checked);
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        const res = await updateAutoBillingSettings({
            autoBillingEnabled: autoBillingEnabled,
        });
        if (res.data) {
            setAutoBillingEnabled(
                res.data.autoBillingEnabled ?? autoBillingEnabled,
            );
            toast.success('Autobilling schedule saved');
            setSaveCooldown(true);
            setTimeout(() => setSaveCooldown(false), 3000);
        } else if (res.error) {
            toast.error(res.error);
        }
        setSavingSettings(false);
    };

    const handleRunNow = async () => {
        setRunningAuto(true);
        const result = await runAutomaticAutobilling();
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.message || 'Automatic autobilling executed');
            await loadLogs();
            if (result.skipped) {
                setRunResult(null);
            } else {
                setRunResult({
                    id: Date.now(),
                    executionDate: new Date().toISOString(),
                    executedAt: new Date().toISOString(),
                    status: result.status || 'SUCCESS',
                    postedCharges: result.postedCharges || 0,
                    totalCharges: result.totalCharges || 0,
                    roomsAffected: result.roomsAffected || 0,
                    rooms: result.rooms || null,
                    totalOutstanding: result.totalOutstanding || 0,
                    errors: result.errors || null,
                    notes: result.message || 'Automatic autobilling executed',
                } as AutoBillingLogEntry);
            }
            setShowRunResultDialog(true);
        }
        setRunningAuto(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return (
                    <Badge className="bg-green-100 text-green-800">
                        Success
                    </Badge>
                );
            case 'PARTIAL':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800">
                        Partial
                    </Badge>
                );
            case 'FAILED':
                return (
                    <Badge className="bg-red-100 text-red-800">Failed</Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const openLogDetail = (log: AutoBillingLogEntry) => {
        setSelectedLog(log);
        setShowLogDialog(true);
    };

    return (
        <div className="w-full space-y-6">
            {showSuccessMessage && (
                <SuccessMessage onClose={() => setShowSuccessMessage(false)} />
            )}
            {showRevertSuccess && (
                <SuccessMessage
                    message="Auto-billing has been successfully reverted."
                    onClose={() => setShowRevertSuccess(false)}
                />
            )}

            {/* Manual Autobilling Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Selection & Info */}
                <div className="lg:col-span-2">
                    <Card className="shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Apply Autobilling</CardTitle>
                                    <CardDescription className="mt-2">
                                        Select occupied rooms to extend by one
                                        night
                                    </CardDescription>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {occupiedOrBookedCount} room(s) available
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : (
                                <MultiSelectAlternative
                                    label="Select Rooms"
                                    id="room_numbers"
                                    items={rooms}
                                    disabled={isLoading}
                                    value={selectedResolved}
                                    onChange={(items: Room[]) => {
                                        setSelectedRooms(
                                            dedupeRoomsById(items),
                                        );
                                        setSelectedRoomIds(
                                            dedupeIds(
                                                items.map((item) =>
                                                    item.id.toString(),
                                                ),
                                            ),
                                        );
                                    }}
                                    displayValue={(room: Room) => room.name}
                                    placeholder="Choose one or more rooms"
                                    className="bg-white h-10"
                                />
                            )}

                            {/* Guidance / Summary */}
                            <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5" />
                                {selectedRooms.length > 0 ? (
                                    <div>
                                        {selectedRooms.length === 1 ? (
                                            <p>
                                                You are about to apply
                                                autobilling to{' '}
                                                <span className="font-medium">
                                                    {selectedRooms[0].name}
                                                </span>
                                                . One additional night will be
                                                added at the current rate, and
                                                the guest&apos;s bill will be
                                                updated.
                                            </p>
                                        ) : (
                                            <p>
                                                You are about to apply
                                                autobilling to{' '}
                                                <span className="font-medium">
                                                    {selectedRooms.length}
                                                </span>{' '}
                                                rooms. Each guest&apos;s stay
                                                will be extended by one
                                                additional night at their
                                                current rate and bills will be
                                                updated.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p>
                                        No rooms selected. Use &apos;Select
                                        all&apos; in the dropdown to apply to
                                        all visible rooms or choose specific
                                        rooms.
                                    </p>
                                )}
                            </div>

                            <div>
                                <BrandButton
                                    onClick={applyAutobilling}
                                    className="w-full"
                                    disabled={submitting || isLoading}
                                    loading={submitting}
                                >
                                    Apply Autobilling
                                </BrandButton>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Apply Confirmation Panel */}
                <div className="lg:col-span-1">
                    {showConfirmationDialog && (
                        <ConfirmationDialog
                            message={
                                pendingAction === 'individual'
                                    ? 'Are you sure you want to apply autobilling to this room?'
                                    : pendingAction === 'multiple'
                                        ? 'Are you sure you want to apply autobilling to selected rooms?'
                                        : 'Are you sure you want to apply autobilling to all occupied rooms?'
                            }
                            onCancel={handleCancelAutobilling}
                            onConfirm={
                                pendingAction === 'individual'
                                    ? handleAutoBillIndividual
                                    : pendingAction === 'multiple'
                                        ? handleAutoBillMultiple
                                        : handleAutoBillAllRooms
                            }
                            loading={submitting}
                        />
                    )}
                    {!showConfirmationDialog && (
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Confirmation
                                </CardTitle>
                                <CardDescription>
                                    Select rooms, then click Apply Autobilling
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    Pending action will appear here for final
                                    confirmation.
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Revert Auto-Billing Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="shadow-none border-red-100">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <RotateCcw className="w-4 h-4 text-red-500" />
                                        Revert Auto-Billing
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Remove the most recent auto-billed night
                                        charge and adjust the checkout date back
                                        for one or more guests.
                                    </CardDescription>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {revertRooms.length} room(s) available
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {revertRoomsLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-20 w-full" />
                                </div>
                            ) : (
                                <MultiSelectAlternative
                                    label="Select Guests / Rooms"
                                    id="revert_room_numbers"
                                    items={revertRooms}
                                    disabled={revertRoomsLoading}
                                    value={selectedRevertResolved}
                                    onChange={(items: Room[]) => {
                                        setSelectedRevertRooms(
                                            dedupeRoomsById(items),
                                        );
                                        setSelectedRevertRoomIds(
                                            dedupeIds(
                                                items.map((item) =>
                                                    item.id.toString(),
                                                ),
                                            ),
                                        );
                                    }}
                                    displayValue={(room: Room) => room.name}
                                    placeholder="Choose one or more guests to revert"
                                    className="bg-white h-10"
                                />
                            )}

                            {/* Guidance / Summary */}
                            <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-800 text-sm flex items-start gap-2">
                                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                                {selectedRevertRooms.length > 0 ? (
                                    <div>
                                        {selectedRevertRooms.length === 1 ? (
                                            <p>
                                                You are about to revert the
                                                latest auto-billed night charge
                                                for{' '}
                                                <span className="font-medium">
                                                    {
                                                        selectedRevertRooms[0]
                                                            .name
                                                    }
                                                </span>
                                                . The extra night charge will be
                                                removed and the checkout date
                                                will be adjusted back.
                                            </p>
                                        ) : (
                                            <p>
                                                You are about to revert the
                                                latest auto-billed night for{' '}
                                                <span className="font-medium">
                                                    {selectedRevertRooms.length}
                                                </span>{' '}
                                                guests. Each guest&apos;s extra
                                                night charge will be removed and
                                                their checkout dates adjusted.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p>
                                        No guests selected. Leave empty and
                                        click &apos;Revert Auto-Billing&apos; to
                                        revert all auto-billed rooms, or choose
                                        specific guests.
                                    </p>
                                )}
                            </div>

                            <div>
                                <BrandButton
                                    onClick={applyRevert}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                    disabled={reverting || revertRoomsLoading}
                                    loading={reverting}
                                    icon={<RotateCcw className="w-4 h-4" />}
                                    iconPosition="left"
                                >
                                    Revert Auto-Billing
                                </BrandButton>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revert Confirmation Panel */}
                <div className="lg:col-span-1">
                    {showRevertConfirmDialog && (
                        <ConfirmationDialog
                            title="Confirm Revert"
                            confirmLabel="Revert Auto-Billing"
                            message={
                                pendingRevertAction === 'individual'
                                    ? 'Are you sure you want to revert the latest auto-billed night for this guest? This will remove the charge and adjust the checkout date back.'
                                    : pendingRevertAction === 'multiple'
                                        ? 'Are you sure you want to revert the latest auto-billed night for the selected guests?'
                                        : 'Are you sure you want to revert the latest auto-billed night for ALL currently checked-in guests?'
                            }
                            onCancel={() => {
                                setShowRevertConfirmDialog(false);
                                setPendingRevertAction(null);
                            }}
                            onConfirm={
                                pendingRevertAction === 'individual'
                                    ? handleRevertIndividual
                                    : pendingRevertAction === 'multiple'
                                        ? handleRevertMultiple
                                        : handleRevertAll
                            }
                            loading={reverting}
                        />
                    )}
                    {!showRevertConfirmDialog && (
                        <Card className="shadow-none border-red-100">
                            <CardHeader>
                                <CardTitle className="text-sm">
                                    Revert Confirmation
                                </CardTitle>
                                <CardDescription>
                                    Select guests, then click Revert
                                    Auto-Billing
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-xs text-muted-foreground">
                                    Pending revert action will appear here for
                                    final confirmation.
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Automatic Autobilling Section */}
            <Card className="shadow-none">
                <CardHeader>
                    <CardTitle>Automatic Autobilling</CardTitle>
                    <CardDescription>
                        Configure ANLI to automatically bill the next night for
                        all occupied rooms at the scheduled time each day.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between flex-wrap">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="auto-billing-enabled"
                                    checked={autoBillingEnabled}
                                    onCheckedChange={(checked) =>
                                        setAutoBillingEnabled(checked)
                                    }
                                    disabled={savingSettings}
                                />
                                <Label
                                    htmlFor="auto-billing-enabled"
                                    className="cursor-pointer whitespace-nowrap"
                                >
                                    {autoBillingEnabled
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </Label>
                            </div>

                            <div className="h-6 w-px bg-gray-200 hidden sm:block" />

                            <div className="text-sm text-muted-foreground">
                                Runs daily at{' '}
                                <span className="font-medium text-foreground">
                                    6:00 PM
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <BrandButton
                                onClick={handleSaveSettings}
                                disabled={savingSettings || saveCooldown}
                                loading={savingSettings}
                                icon={<Save size={16} />}
                                iconPosition="left"
                            >
                                {saveCooldown ? 'Saved' : 'Save'}
                            </BrandButton>
                            <div className="flex items-center gap-3">
                                <BrandButton
                                    onClick={handleRunNow}
                                    disabled={
                                        runningAuto || !autoBillingEnabled
                                    }
                                    loading={runningAuto}
                                    icon={<Play size={16} />}
                                    iconPosition="left"
                                >
                                    Run Now
                                </BrandButton>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        When enabled, ANLI will automatically run autobilling
                        daily at 5:00 PM for all occupied rooms.
                    </p>

                    {/* Execution Logs */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <History
                                size={16}
                                className="text-muted-foreground"
                            />
                            <h3 className="text-sm font-medium">
                                Execution History
                            </h3>
                        </div>
                        {loadingLogs ? (
                            <Skeleton className="h-32 w-full" />
                        ) : logs.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No execution history yet.
                            </p>
                        ) : (
                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Executed At</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Rooms</TableHead>
                                            <TableHead>Count</TableHead>
                                            <TableHead>Charges</TableHead>
                                            <TableHead>Outstanding</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="cursor-pointer"
                                                onClick={() =>
                                                    openLogDetail(log)
                                                }
                                            >
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(
                                                        log.executionDate,
                                                    ).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap">
                                                    {new Date(
                                                        log.executedAt,
                                                    ).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(log.status)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {(log.rooms || []).map(
                                                            (room, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                                                                >
                                                                    {room}
                                                                </span>
                                                            ),
                                                        )}
                                                        {(!log.rooms ||
                                                            log.rooms.length ===
                                                            0) && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    -
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {log.roomsAffected}
                                                </TableCell>
                                                <TableCell>
                                                    {log.postedCharges}
                                                </TableCell>
                                                <TableCell>
                                                    ₦
                                                    {Number(
                                                        log.totalOutstanding,
                                                    ).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Autobilling Log Details</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Date
                                    </p>
                                    <p className="text-sm font-medium">
                                        {new Date(
                                            selectedLog.executionDate,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Executed At
                                    </p>
                                    <p className="text-sm font-medium">
                                        {new Date(
                                            selectedLog.executedAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Status
                                    </p>
                                    <div>
                                        {getStatusBadge(selectedLog.status)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Rooms Affected
                                    </p>
                                    <p className="text-sm font-medium">
                                        {selectedLog.roomsAffected}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Posted Charges
                                    </p>
                                    <p className="text-sm font-medium">
                                        {selectedLog.postedCharges}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Outstanding
                                    </p>
                                    <p className="text-sm font-medium">
                                        ₦
                                        {Number(
                                            selectedLog.totalOutstanding,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Rooms Billed
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedLog.rooms || []).map(
                                        (room, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                                            >
                                                {room}
                                            </span>
                                        ),
                                    )}
                                    {(!selectedLog.rooms ||
                                        selectedLog.rooms.length === 0) && (
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                </div>
                            </div>

                            {selectedLog.errors &&
                                Object.keys(selectedLog.errors).length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Errors
                                        </p>
                                        <div className="space-y-1">
                                            {Object.entries(
                                                selectedLog.errors,
                                            ).map(([key, message]) => (
                                                <div
                                                    key={key}
                                                    className="text-xs bg-red-50 text-red-800 rounded-md px-3 py-2"
                                                >
                                                    <span className="font-medium">
                                                        {key}:
                                                    </span>{' '}
                                                    {message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {selectedLog.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Notes
                                    </p>
                                    <p className="text-sm bg-gray-50 rounded-md px-3 py-2">
                                        {selectedLog.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={showRunResultDialog}
                onOpenChange={setShowRunResultDialog}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Auto-Billing Execution Summary
                        </DialogTitle>
                    </DialogHeader>
                    {runResult && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Executed At
                                    </p>
                                    <p className="text-sm font-medium">
                                        {new Date(
                                            runResult.executedAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Status
                                    </p>
                                    <div>
                                        {getStatusBadge(runResult.status)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Rooms Successfully Billed
                                    </p>
                                    <p className="text-sm font-medium">
                                        {runResult.roomsAffected}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Total Charges Applied
                                    </p>
                                    <p className="text-sm font-medium">
                                        ₦
                                        {Number(
                                            runResult.totalCharges ||
                                            runResult.postedCharges,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Combined Outstanding
                                    </p>
                                    <p className="text-sm font-medium">
                                        ₦
                                        {Number(
                                            runResult.totalOutstanding,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    Rooms Billed
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(runResult.rooms || []).map(
                                        (room, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                                            >
                                                {room}
                                            </span>
                                        ),
                                    )}
                                    {(!runResult.rooms ||
                                        runResult.rooms.length === 0) && (
                                            <span className="text-xs text-muted-foreground">
                                                No rooms billed
                                            </span>
                                        )}
                                </div>
                            </div>

                            {runResult.errors &&
                                Object.keys(runResult.errors).length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            Errors
                                        </p>
                                        <div className="space-y-1">
                                            {Object.entries(
                                                runResult.errors,
                                            ).map(([key, message]) => (
                                                <div
                                                    key={key}
                                                    className="text-xs bg-red-50 text-red-800 rounded-md px-3 py-2"
                                                >
                                                    <span className="font-medium">
                                                        {key}:
                                                    </span>{' '}
                                                    {message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {runResult.notes && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        Notes
                                    </p>
                                    <p className="text-sm bg-gray-50 rounded-md px-3 py-2">
                                        {runResult.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const SuccessMessage = ({
    onClose,
    message = 'Autobilling has been added successfully',
}: {
    onClose: () => void;
    message?: string;
}) => (
    <Card className="border border-green-300 bg-green-50 shadow-none">
        <CardContent className="px-6 py-3">
            <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <BadgeCheck className="text-green-600" size={20} />
                    <span className="text-sm text-green-800">{message}</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-green-600 hover:text-green-700"
                    aria-label="Close success message"
                >
                    <X size={20} />
                </button>
            </div>
        </CardContent>
    </Card>
);

const ConfirmationDialog = ({
    title = 'Confirm Autobilling',
    confirmLabel = 'Apply Autobilling',
    message,
    onCancel,
    onConfirm,
    loading,
}: {
    title?: string;
    confirmLabel?: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
}) => (
    <Card className="border border-red-200 bg-red-50 shadow-none">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-900">{title}</CardTitle>
            <CardDescription className="text-red-900/80">
                {message}
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
            <div className="flex flex-col gap-2 items-stretch w-full">
                <BrandButton
                    onClick={onCancel}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-600 w-full"
                >
                    Cancel
                </BrandButton>
                <BrandButton
                    onClick={onConfirm}
                    className="w-full"
                    loading={!!loading}
                    disabled={!!loading}
                >
                    {confirmLabel}
                </BrandButton>
            </div>
        </CardContent>
    </Card>
);
