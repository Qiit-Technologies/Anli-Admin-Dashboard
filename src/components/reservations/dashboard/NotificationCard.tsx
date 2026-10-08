'use client';

import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface ReservationNotification {
    id: string;
    title: string;
    description: string;
    actionText: string;
    actionUrl?: string | null;
    actionColor?: string;
    actionBgColor?: string;
    bgColor?: string;
}

interface NotificationCardProps {
    notifications?: ReservationNotification[];
    onDismiss?: (id: string) => void;
    onAction?: (id: string) => void;
    onEdit?: (id: string) => void;
}

const defaultNotifications: ReservationNotification[] = [
    {
        id: '1',
        title: 'New reservation',
        description:
            'Orders ready for pickup but not collected after 24 days/hours.',
        actionText: 'Book appointment',
        actionColor: '#A02724',
        actionBgColor: '#FFF0F0',
        bgColor: '#FFF9F9',
    },
    {
        id: '2',
        title: 'Reservation is in 2 hr',
        description:
            'this Reservation will be due in 2 hour send reminder to mr kings',
        actionText: 'Send Reminder',
        actionColor: '#B54708',
        actionBgColor: '#FFFAEB',
        bgColor: '#FEF9F1',
    },
];

export default function NotificationCard({
    notifications: initialNotifications = defaultNotifications,
    onDismiss,
    onAction,
    onEdit,
}: NotificationCardProps) {
    const router = useRouter();
    const [notifications, setNotifications] = useState(initialNotifications);

    React.useEffect(() => {
        if (initialNotifications) {
            setNotifications(initialNotifications);
        }
    }, [initialNotifications]);

    const handleDismiss = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        onDismiss?.(id);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-5 w-full lg:max-w-[509px] lg:max-h-[359px] overflow-hidden flex flex-col">
            <h3 className="font-normal  mb-4">Reservations Notification</h3>

            <div
                className="space-y-3 overflow-y-auto flex-1 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {notifications.length === 0 ? (
                    <p className="text-sm text-center py-4">
                        No new notifications
                    </p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="flex gap-4 p-5 rounded-[8px] shadow-md"
                            style={{
                                backgroundColor:
                                    notification.bgColor || '#F9FAFB',
                            }}
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-[#F2F4F7] rounded-full flex items-center justify-center">
                                    <Image
                                        src="/reservation/notification.svg"
                                        width={20}
                                        height={20}
                                        alt="notification"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-medium text-sm">
                                        {notification.title}
                                    </h4>
                                    <button
                                        onClick={() =>
                                            handleDismiss(notification.id)
                                        }
                                        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <p className="text-sm text-[#667085] mt-1 leading-5">
                                    {notification.description}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (notification.actionUrl) {
                                                router.push(notification.actionUrl);
                                                return;
                                            }
                                            onAction?.(notification.id);
                                        }}
                                        className="text-xs font-normal transition-opacity p-1 px-3 rounded-2xl"
                                        style={{
                                            color: notification.actionColor,
                                            backgroundColor:
                                                notification.actionBgColor,
                                        }}
                                    >
                                        {notification.actionText}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEdit?.(notification.id)}
                                        className="text-xs font-normal transition-opacity p-1 px-3 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Edit/Adjust
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
