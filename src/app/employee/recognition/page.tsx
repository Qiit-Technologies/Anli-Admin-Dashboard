'use client';

import { useEffect, useState } from 'react';
import { getRecognitions, getLeaderboard } from '@/app/actions/recognition';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader } from '@/components/common/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GivePraiseDialog } from '@/components/recognition/GivePraiseDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaStar, FaTrophy } from 'react-icons/fa';

const RECOGNITION_TYPE_LABELS: Record<
    string,
    { icon: string; color: string; label: string }
> = {
    excellent_service: {
        icon: '⭐',
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Excellent Service',
    },
    teamwork: {
        icon: '🤝',
        color: 'bg-blue-100 text-blue-800',
        label: 'Teamwork',
    },
    innovation: {
        icon: '💡',
        color: 'bg-purple-100 text-purple-800',
        label: 'Innovation',
    },
    dedication: {
        icon: '💪',
        color: 'bg-red-100 text-red-800',
        label: 'Dedication',
    },
    leadership: {
        icon: '👑',
        color: 'bg-indigo-100 text-indigo-800',
        label: 'Leadership',
    },
    customer_satisfaction: {
        icon: '😊',
        color: 'bg-green-100 text-green-800',
        label: 'Customer Satisfaction',
    },
    problem_solving: {
        icon: '🧩',
        color: 'bg-orange-100 text-orange-800',
        label: 'Problem Solving',
    },
    going_extra_mile: {
        icon: '🏃',
        color: 'bg-pink-100 text-pink-800',
        label: 'Going the Extra Mile',
    },
};

export default function RecognitionPage() {
    const [recognitions, setRecognitions] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const [recognitionsResult, leaderboardResult] = await Promise.all([
                getRecognitions({ limit: 50 }),
                getLeaderboard(10),
            ]);

            setRecognitions(recognitionsResult.data || []);
            setLeaderboard(leaderboardResult || []);
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to load recognition data';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h1 className="text-2xl font-semibold text-black flex items-center gap-2">
                            <FaStar className="text-yellow-500" />
                            Staff Recognition & Praise
                        </h1>
                        <p className="text-sm text-gray-500">
                            Celebrate excellence and acknowledge great work
                        </p>
                    </div>
                    <GivePraiseDialog onSuccess={loadData} />
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recognition Feed */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold mb-4">
                        Recent Recognition
                    </h2>

                    {loading ? (
                        <Card className="p-12 text-center">Loading...</Card>
                    ) : recognitions.length === 0 ? (
                        <Card className="p-12 text-center">
                            <p className="text-gray-500">
                                No recognition yet. Be the first to praise a
                                colleague!
                            </p>
                        </Card>
                    ) : (
                        recognitions.map((recognition: any) => {
                            const typeInfo = RECOGNITION_TYPE_LABELS[
                                recognition.type || ''
                            ] || {
                                icon: '⭐',
                                color: 'bg-gray-100 text-gray-800',
                                label: recognition.type || '',
                            };

                            return (
                                <Card
                                    key={recognition.id || Math.random()}
                                    className="p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        {/* Avatar Placeholder */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                                                {
                                                    recognition.recipient
                                                        ?.firstName?.[0]
                                                }
                                                {
                                                    recognition.recipient
                                                        ?.lastName?.[0]
                                                }
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-lg">
                                                        {
                                                            recognition
                                                                .recipient
                                                                ?.firstName
                                                        }{' '}
                                                        {
                                                            recognition
                                                                .recipient
                                                                ?.lastName
                                                        }
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Recognized by{' '}
                                                        {
                                                            recognition.givenBy
                                                                ?.firstName
                                                        }{' '}
                                                        {
                                                            recognition.givenBy
                                                                ?.lastName
                                                        }
                                                    </p>
                                                </div>
                                                <Badge
                                                    className={typeInfo.color}
                                                >
                                                    {typeInfo.icon}{' '}
                                                    {typeInfo.label}
                                                </Badge>
                                            </div>

                                            {/* Message */}
                                            <p className="text-gray-700 mb-3">
                                                {recognition.message}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <span>
                                                    📅{' '}
                                                    {format(
                                                        new Date(
                                                            recognition.createdAt,
                                                        ),
                                                        'MMM dd, yyyy',
                                                    )}
                                                </span>
                                                {recognition.points > 0 && (
                                                    <Badge className="bg-yellow-500 text-white">
                                                        +{recognition.points}{' '}
                                                        points
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Leaderboard */}
                <div>
                    <Card className="p-6 sticky top-4">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FaTrophy className="text-yellow-500" />
                            Top Recognition Leaders
                        </h2>

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Loading...
                            </p>
                        ) : leaderboard.length === 0 ? (
                            <p className="text-center text-gray-500">
                                No data yet
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {leaderboard.map((staff: any, index) => {
                                    return (
                                        <div
                                            key={staff.staffId || index}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                                {index === 0 && (
                                                    <span className="text-2xl">
                                                        🥇
                                                    </span>
                                                )}
                                                {index === 1 && (
                                                    <span className="text-2xl">
                                                        🥈
                                                    </span>
                                                )}
                                                {index === 2 && (
                                                    <span className="text-2xl">
                                                        🥉
                                                    </span>
                                                )}
                                                {index > 2 && (
                                                    <span className="text-sm font-semibold text-gray-600">
                                                        #{index + 1}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                                                {staff.firstName?.[0]}
                                                {staff.lastName?.[0]}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">
                                                    {staff.firstName}{' '}
                                                    {staff.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {staff.recognitioncount}{' '}
                                                    recognition
                                                    {staff.recognitioncount !==
                                                    '1'
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            </div>

                                            {/* Points */}
                                            <div className="text-right">
                                                <p className="font-bold text-yellow-600">
                                                    {staff.totalpoints}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    points
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </PageWrapper>
    );
}
