'use client';

import {
    getTodaysBirthdays,
    getUpcomingBirthdays,
    sendBirthdayNotifications,
} from '@/app/actions/membership';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cake, Calendar, Loader2, Mail, Phone, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface BirthdayMember {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    plan?: {
        name: string;
    };
    membership?: {
        hotel?: {
            name: string;
        };
    };
}

interface BirthdayNotificationsProps {
    className?: string;
}

const BirthdayNotifications: React.FC<BirthdayNotificationsProps> = ({
    className = '',
}) => {
    const [todaysBirthdayMembers, setTodaysBirthdayMembers] = useState<
        BirthdayMember[]
    >([]);
    const [upcomingBirthdayMembers, setUpcomingBirthdayMembers] = useState<
        BirthdayMember[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [upcomingDays, setUpcomingDays] = useState(7);
    const [sendingNotifications, setSendingNotifications] = useState(false);

    const fetchBirthdays = async () => {
        try {
            setLoading(true);
            setError(null);

            const todayResponse = await getTodaysBirthdays();
            if (todayResponse.error) {
                setError(todayResponse.error);
            } else if (todayResponse.success && todayResponse.data) {
                setTodaysBirthdayMembers(todayResponse.data.birthdays || []);
            }

            const upcomingResponse = await getUpcomingBirthdays(upcomingDays);
            if (upcomingResponse.success && upcomingResponse.data) {
                setUpcomingBirthdayMembers(
                    upcomingResponse.data.birthdays || [],
                );
            }
        } catch (err) {
            console.error('Error fetching birthdays:', err);
            setError('Failed to load birthday notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBirthdays();
    }, [upcomingDays]);

    const handleSendBirthdayNotifications = async () => {
        try {
            setSendingNotifications(true);
            const response = await sendBirthdayNotifications();

            if (response.error) {
                toast.error(response.error);
            } else if (response.success) {
                toast.success(
                    response.message ||
                        'Birthday notifications sent successfully',
                );
            }
        } catch (error: any) {
            console.error('Error sending birthday notifications:', error);
            toast.error('Failed to send birthday notifications');
        } finally {
            setSendingNotifications(false);
        }
    };

    const formatBirthday = (dateOfBirth: Date) => {
        const date = new Date(dateOfBirth);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateAge = (dateOfBirth: Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        return age;
    };

    const getDaysUntilBirthday = (dateOfBirth: Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        const thisYear = today.getFullYear();

        const birthdayThisYear = new Date(
            thisYear,
            birthDate.getMonth(),
            birthDate.getDate(),
        );

        if (birthdayThisYear < today) {
            birthdayThisYear.setFullYear(thisYear + 1);
        }

        const diffTime = birthdayThisYear.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    };

    if (loading) {
        return (
            <Card className={`h-full ${className} shadow-none`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Birthday Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading birthdays...
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={`h-full ${className} shadow-none`}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Birthday Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-sm text-red-600">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchBirthdays}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalBirthdays =
        todaysBirthdayMembers.length + upcomingBirthdayMembers.length;

    return (
        <Card className={`h-full ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Cake className="h-5 w-5 text-pink-500" />
                        Birthday Notifications
                        {totalBirthdays > 0 && (
                            <Badge
                                variant="secondary"
                                className="bg-pink-100 text-pink-700"
                            >
                                {totalBirthdays}
                            </Badge>
                        )}
                    </CardTitle>
                    {todaysBirthdayMembers.length > 0 && (
                        <Button
                            size="sm"
                            onClick={handleSendBirthdayNotifications}
                            disabled={sendingNotifications}
                            className="bg-pink-500 hover:bg-pink-600"
                        >
                            {sendingNotifications ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Notifications'
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[320px] overflow-y-auto">
                {/* Today's Birthdays */}
                {todaysBirthdayMembers.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                            <Cake className="h-4 w-4 text-pink-500" />
                            Today&apos;s Birthdays (
                            {todaysBirthdayMembers.length})
                        </h4>
                        <div className="space-y-2">
                            {todaysBirthdayMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-2 bg-pink-50 border border-pink-200 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 bg-pink-500 text-white rounded-full">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">
                                                {member.firstName}{' '}
                                                {member.lastName}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                Turning{' '}
                                                {calculateAge(
                                                    member.dateOfBirth,
                                                ) + 1}{' '}
                                                today! 🎉
                                            </p>
                                            {member.plan?.name && (
                                                <p className="text-xs text-gray-500">
                                                    Plan: {member.plan.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {member.phone && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    window.open(
                                                        `tel:${member.phone}`,
                                                    )
                                                }
                                                className="p-2"
                                            >
                                                <Phone className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {member.email && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    window.open(
                                                        `mailto:${member.email}`,
                                                    )
                                                }
                                                className="p-2"
                                            >
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Birthdays */}
                {upcomingBirthdayMembers.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                Upcoming Birthdays (
                                {upcomingBirthdayMembers.length})
                            </h4>
                            <select
                                value={upcomingDays}
                                onChange={(e) =>
                                    setUpcomingDays(Number(e.target.value))
                                }
                                className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                            >
                                <option value={7}>Next 7 days</option>
                                <option value={14}>Next 14 days</option>
                                <option value={30}>Next 30 days</option>
                            </select>
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {upcomingBirthdayMembers.map((member) => {
                                const daysUntil = getDaysUntilBirthday(
                                    member.dateOfBirth,
                                );
                                return (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-xs">
                                                {daysUntil}d
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">
                                                    {member.firstName}{' '}
                                                    {member.lastName}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {formatBirthday(
                                                        member.dateOfBirth,
                                                    )}{' '}
                                                    • {daysUntil} days
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {member.phone && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        window.open(
                                                            `tel:${member.phone}`,
                                                        )
                                                    }
                                                    className="p-1 h-6 w-6"
                                                >
                                                    <Phone className="h-3 w-3" />
                                                </Button>
                                            )}
                                            {member.email && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        window.open(
                                                            `mailto:${member.email}`,
                                                        )
                                                    }
                                                    className="p-1 h-6 w-6"
                                                >
                                                    <Mail className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* No Birthdays */}
                {totalBirthdays === 0 && (
                    <div className="text-center py-8">
                        <Cake className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-1">
                            No upcoming birthdays
                        </p>
                        <p className="text-xs text-gray-400">
                            Check back later for birthday notifications
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BirthdayNotifications;
