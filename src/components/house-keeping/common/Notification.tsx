'use client';
import {
    getGuestDueForCheckOut,
    getWakeUpCall,
    markAllWakeUpCallComplete,
    markOneWakeUpCallAsComplete,
} from '@/app/actions/guest';
import { getMaintenanceOverdueForInspection } from '@/app/actions/houseKeeping';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { differenceInMinutes, format, parse } from 'date-fns';
import { Bell, BellRing, Check, Clock, Hotel, User, Wrench } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

interface WakeUpCall {
    id: number;
    description: string;
    completed: boolean;
    time: string;
    guest: any;
    status: 'pending' | 'completed';
    createdAt: string;
}

interface DueCheckout {
    id: number;
    guest: any;
    checkoutDate: string;
    status: 'pending' | 'completed';
    room: any;
    roomNumber?: string;
    fullName: string;
    endTime: string;
}

type MaintenanceOverdueAlert = {
    id: number;
    description: string;
    issueType: string;
    expectedResolutionAt: string;
    room?: { roomNumber?: string };
    status: 'pending';
};

type NotificationItem = {
    type: 'wakeup' | 'checkout' | 'maintenance';
    data: WakeUpCall | DueCheckout | MaintenanceOverdueAlert;
};

type CardProps = {
    className?: string;
    children?: React.ReactNode;
};

export function NotificationsPopover({
    className,
    children,
    ...props
}: Readonly<CardProps>) {
    const { data: notifications } = useSWR(
        '/guests/wake-up-call',
        getWakeUpCall,
        {
            refreshInterval: 60000,
        },
    );

    const { data: dueCheckout } = useSWR(
        '/guests/due-for-checkout',
        getGuestDueForCheckOut,
        {
            refreshInterval: 60000,
        },
    );

    const { data: overdueMaintenance } = useSWR(
        '/housekeeping/maintenance/overdue-inspection',
        async () => {
            const res = await getMaintenanceOverdueForInspection();
            if (res && typeof res === 'object' && 'message' in res) {
                return [];
            }
            return Array.isArray(res) ? res : [];
        },
        { refreshInterval: 120000 },
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const [reminderTimeframe] = React.useState(5);
    const [, setError] = React.useState<string | null>(null);
    const [, setIsLoading] = React.useState(false);
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
    const previousNotificationsDataRef = useRef<
        NotificationItem[] | undefined
    >();

    // Remap and combine notifications and due checkouts
    const combinedNotifications = React.useMemo(() => {
        const wakeUpCalls =
            notifications?.data && notifications.data.length > 0
                ? notifications.data.map((call: WakeUpCall) => ({
                      type: 'wakeup' as const,
                      data: {
                          ...call,
                          status: call.completed ? 'completed' : 'pending',
                      },
                  }))
                : [];

        const dueCheckouts =
            dueCheckout?.data && dueCheckout.data.length > 0
                ? dueCheckout.data.map((checkout: DueCheckout) => ({
                      type: 'checkout' as const,
                      data: {
                          ...checkout,
                          status: 'pending', // Assuming all due checkouts are pending
                      },
                  }))
                : [];

        const maintenanceAlerts =
            Array.isArray(overdueMaintenance) && overdueMaintenance.length > 0
                ? overdueMaintenance.map((row: Record<string, unknown>) => ({
                      type: 'maintenance' as const,
                      data: {
                          id: row.id as number,
                          description: String(row.description ?? ''),
                          issueType: String(row.issueType ?? ''),
                          expectedResolutionAt: String(
                              row.expectedResolutionAt ?? '',
                          ),
                          room: row.room as MaintenanceOverdueAlert['room'],
                          status: 'pending' as const,
                      },
                  }))
                : [];

        return [...wakeUpCalls, ...dueCheckouts, ...maintenanceAlerts];
    }, [notifications, dueCheckout, overdueMaintenance]);

    const pendingCount = combinedNotifications.filter(
        (item) => item.data.status === 'pending',
    ).length;

    useEffect(() => {
        if (pendingCount > 0) {
            setIsOpen(true);
        }
    }, [pendingCount]);

    const playNotificationSound = async () => {
        if (!notificationAudioRef.current) return;

        try {
            notificationAudioRef.current.loop = true;
            notificationAudioRef.current.volume = 1;
            notificationAudioRef.current.currentTime = 0;
            await notificationAudioRef.current.play();
        } catch (err) {
            console.log('Audio playback failed:', err);
            // Fallback: Try again after user interaction
            document.addEventListener(
                'click',
                () => {
                    notificationAudioRef.current
                        ?.play()
                        .catch((e) => console.log('Still failed:', e));
                },
                { once: true },
            );
        }
    };

    useEffect(() => {
        if (!notifications?.data?.length) return;

        const interval = setInterval(() => {
            const now = new Date();
            const upcomingCalls = notifications.data.filter(
                (call: WakeUpCall) => {
                    const [hours, minutes] = call.time.split(':');
                    const callTime = new Date();
                    callTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    const minsUntilCall = differenceInMinutes(callTime, now);
                    return (
                        minsUntilCall > 0 && minsUntilCall <= reminderTimeframe
                    );
                },
            );

            if (upcomingCalls.length > 0) {
                setIsOpen(true);
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [notifications, reminderTimeframe]);

    // Replace your useEffect with this:
    useEffect(() => {
        notificationAudioRef.current = new Audio('/notification.wav');
        notificationAudioRef.current.load();

        // Cleanup
        return () => {
            if (notificationAudioRef.current) {
                notificationAudioRef.current.pause();
                notificationAudioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const currentData = combinedNotifications;

        if (!Array.isArray(currentData)) return;

        const prevData = previousNotificationsDataRef.current;
        previousNotificationsDataRef.current = currentData;

        if (!prevData || prevData.length === 0) return;

        // Find new pending notifications
        const newPending = currentData.filter(
            (newNotif) =>
                newNotif.data.status === 'pending' &&
                !prevData.some(
                    (prevNotif) =>
                        prevNotif.type === newNotif.type &&
                        prevNotif.data.id === newNotif.data.id,
                ),
        );

        if (newPending.length > 0) {
            playNotificationSound();
        }
    }, [combinedNotifications]);

    const markCallAsComplete = async (callId: number) => {
        setError(null);
        setIsLoading(true);
        try {
            const response = await markOneWakeUpCallAsComplete(callId);
            if (response) {
                if (response.message === 'Marked wake up call as completed') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    mutate('/guests/wake-up-call');
                    setIsLoading(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const markALlAsComplete = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const response = await markAllWakeUpCallComplete();
            if (response) {
                if (
                    response.message === 'Marked all wake up calls as completed'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    mutate('/guests/wake-up-call');
                    setIsLoading(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderNotificationItem = (item: NotificationItem) => {
        if (item.type === 'maintenance') {
            const m = item.data as MaintenanceOverdueAlert;
            return (
                <div
                    key={`maintenance-${m.id}`}
                    className="rounded-md px-3 py-2 text-sm flex flex-col gap-1 border shadow-sm bg-amber-50 border-amber-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                            <Wrench size={12} className="text-amber-700" />
                            <span>
                                Room #
                                {m.room?.roomNumber?.toString() ?? 'N/A'}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            Maintenance due
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-700 line-clamp-2">
                        {m.description}
                    </p>
                    <p className="text-[10px] text-amber-800">
                        Expected resolved by:{' '}
                        {m.expectedResolutionAt
                            ? format(
                                  new Date(m.expectedResolutionAt),
                                  'MMM d, h:mm a',
                              )
                            : '—'}
                    </p>
                </div>
            );
        }
        if (item.type === 'wakeup') {
            const call = item.data as WakeUpCall;
            return (
                <div
                    key={`wakeup-${call.id}`}
                    className={cn(
                        'rounded-md px-3 py-2 text-sm flex flex-col gap-1 border shadow-sm group transition-all duration-150',
                        call.status === 'pending'
                            ? 'bg-white border-orange-200 hover:shadow-md'
                            : 'bg-gray-50 border-gray-200 hover:shadow-sm',
                    )}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <span
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    call.status === 'pending'
                                        ? 'bg-orange-500'
                                        : 'bg-green-500',
                                )}
                            />
                            <span>Room #{call?.guest?.room?.roomNumber ?? call?.guest?.roomNumber ?? 'N/A'}</span>
                        </div>
                        <span
                            className={cn(
                                'text-[10px] font-medium px-2 py-0.5 rounded-full capitalize',
                                call.status === 'pending'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700',
                            )}
                        >
                            {call.status}
                        </span>
                    </div>

                    <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                        <User size={10} className="text-orion-blue" />
                        <span className="truncate">{call?.guest?.fullName ?? 'N/A'}</span>
                    </div>

                    <div className="flex items-center text-[11px] text-gray-400 gap-1.5">
                        <Clock size={10} className="text-orion-blue" />
                        <span>
                            {format(
                                parse(call.time, 'HH:mm:ss', new Date()),
                                'h:mm a',
                            )}
                        </span>
                    </div>

                    {call.description && (
                        <div className="text-[11px] text-gray-600 mt-1 bg-blue-50 border border-blue-100 rounded px-2 py-1">
                            <span className="font-semibold text-blue-600">
                                Note:
                            </span>{' '}
                            {call.description}
                        </div>
                    )}
                    <PermissionGate
                        permissions={[PERMISSIONS.CREATE_RESERVATION]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Button
                            size={'sm'}
                            variant={'outline'}
                            className="border-orion-blue mt-2 text-orion-blue w-full"
                            onClick={() => markCallAsComplete(call.id)}
                        >
                            Mark as completed
                        </Button>
                    </PermissionGate>
                </div>
            );
        } else {
            const checkout = item.data as DueCheckout;
            return (
                <div
                    key={`checkout-${checkout.id}`}
                    className="rounded-md px-3 py-2 text-sm flex flex-col gap-1 border shadow-sm group transition-all duration-150 bg-white border-red-200 hover:shadow-md"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span>Room #{checkout?.room?.roomNumber ?? checkout?.roomNumber ?? 'N/A'}</span>
                        </div>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize bg-red-100 text-red-700">
                            Due for checkout
                        </span>
                    </div>

                    <div className="flex items-center text-[11px] text-gray-500 gap-1.5">
                        <User size={10} className="text-orion-blue" />
                        <span className="truncate">{checkout?.fullName}</span>
                    </div>

                    <div className="flex items-center text-[11px] text-gray-400 gap-1.5">
                        <Clock size={10} className="text-orion-blue" />
                        <span>
                            {format(
                                (() => {
                                    const [hours, minutes] = (
                                        checkout?.endTime || '12:00'
                                    )
                                        .split(':')
                                        .map(Number);
                                    const d = new Date();
                                    d.setHours(hours, minutes, 0, 0);
                                    return d;
                                })(),
                                'p',
                            )}
                        </span>
                    </div>

                    <Button
                        size={'sm'}
                        variant={'outline'}
                        className="border-orion-blue mt-2 text-orion-blue w-full"
                        onClick={() => {
                            // Add your checkout action here
                        }}
                    >
                        Process Checkout
                    </Button>
                </div>
            );
        }
    };

    return (
        <Popover
            defaultOpen={pendingCount > 0}
            open={isOpen}
            onOpenChange={(open) => {
                setIsOpen(open);
                if (!open && notificationAudioRef.current) {
                    notificationAudioRef.current.pause();
                    notificationAudioRef.current.currentTime = 0;
                }
            }}
        >
            <PopoverTrigger asChild>
                {children || (
                    <Button
                        type="button"
                        variant={'outline'}
                        className="flex relative rounded-full h-10 shadow-none ml-3 w-10 items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
                        onClick={() => setIsOpen(true)}
                    >
                        <Bell size={18} />
                        {pendingCount > 0 && (
                            <span className="absolute -top-2 -right-1 z-50 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {pendingCount}
                            </span>
                        )}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className={cn('w-[400px]', className)}
                {...props}
            >
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium leading-none text-lg">
                                Notifications
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {pendingCount > 0
                                    ? `${pendingCount} pending item${pendingCount > 1 ? 's' : ''}`
                                    : 'All caught up'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <BellRing size={18} className="text-orion-blue" />
                            <Switch className="data-[state=checked]:bg-orion-blue" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {combinedNotifications.length > 0 ? (
                        combinedNotifications.map((item) =>
                            renderNotificationItem(item),
                        )
                    ) : (
                        <div className="text-center py-6 px-2">
                            <Hotel
                                size={28}
                                className="mx-auto text-gray-300 mb-1"
                            />
                            <p className="text-gray-500 text-xs font-medium">
                                No notifications
                            </p>
                            <p className="text-[10px] text-gray-400">
                                All rooms are accounted for
                            </p>
                        </div>
                    )}
                </div>

                {pendingCount > 0 && (
                    <div className="mt-4 pt-2 border-t">
                        <PermissionGate
                            permissions={[PERMISSIONS.CREATE_RESERVATION]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <Button
                                onClick={markALlAsComplete}
                                className="w-full bg-orion-blue hover:bg-orion-blue/90 h-10"
                            >
                                <Check className="mr-2 h-4 w-4" /> Mark all as
                                completed
                            </Button>
                        </PermissionGate>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
