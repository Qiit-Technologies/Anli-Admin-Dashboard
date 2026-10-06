/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import useSWR from 'swr';
import { getRecognitions, getLeaderboard } from '@/app/actions/recognition';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GivePraiseDialog } from '@/components/recognition/GivePraiseDialog';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useUser } from '@/context/useUser';
import { Button } from '@/components/ui/button';
import { EditRecognitionDialog } from '@/components/recognition/EditRecognitionDialog';
import { Loader2 } from 'lucide-react';

export default function RecognitionPage() {
    const { user } = useUser();
    const isAdministrator = user?.roles?.name === 'administrator';

    const recognitionsFetcher = async () => {
        const result = await getRecognitions({ limit: 50 });
        return result.data || [];
    };

    const leaderboardFetcher = async () => {
        const result = await getLeaderboard(10);
        return result || [];
    };

    const {
        data: recognitions = [],
        isLoading: recognitionsLoading,
        mutate: mutateRecognitions,
    } = useSWR(['recognitions'], recognitionsFetcher, {
        onError: (error) => {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to load recognition data';
            toast.error(errorMessage);
        },
    });

    const {
        data: leaderboard = [],
        isLoading: leaderboardLoading,
        mutate: mutateLeaderboard,
    } = useSWR(['leaderboard'], leaderboardFetcher, {
        onError: (error) => {
            console.error('Failed to load leaderboard:', error);
        },
    });

    const loading = recognitionsLoading || leaderboardLoading;

    const refreshData = () => {
        mutateRecognitions();
        mutateLeaderboard();
    };

    return (
        <PageWrapper className="px-0">
            <div className="px-2">
                <PageHeader>
                    <div className="flex justify-between items-center w-full">
                        <PageHeadertitle
                            title="Staff Recognition"
                            subtitle="Acknowledge and celebrate great work"
                        />
                        <GivePraiseDialog onSuccess={refreshData} />
                    </div>
                </PageHeader>
            </div>
            <div className="px-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recognition Feed */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-black font-sans mb-4">
                                    Recent Recognition
                                </h2>

                                {loading ? (
                                    <div className="text-center flex item-center justify-center py-12">
                                        <Loader2 className="w-10 h-10 animate-spin text-brand" />
                                    </div>
                                ) : recognitions.length === 0 ? (
                                    <Card className="p-12 text-center">
                                        <p className="text-gray-500">
                                            No recognition yet
                                        </p>
                                    </Card>
                                ) : (
                                    <div className="space-y-3">
                                        {recognitions.map(
                                            (recognition: any) => (
                                                <Card
                                                    key={recognition.id}
                                                    className="p-4 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-12 h-12 rounded-full bg-orion-blue flex items-center justify-center text-white font-bold">
                                                                {
                                                                    recognition
                                                                        .recipient
                                                                        ?.fullName?.[0]
                                                                }
                                                            </div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <p className="font-semibold text-base">
                                                                        {
                                                                            recognition
                                                                                .recipient
                                                                                ?.fullName
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        By{' '}
                                                                        {
                                                                            recognition
                                                                                .givenBy
                                                                                ?.fullName
                                                                        }
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge>
                                                                        {recognition.type.replace(
                                                                            '_',
                                                                            ' ',
                                                                        )}
                                                                    </Badge>
                                                                    {recognition.points >
                                                                        0 && (
                                                                        <Badge variant="secondary">
                                                                            +
                                                                            {
                                                                                recognition.points
                                                                            }{' '}
                                                                            pts
                                                                        </Badge>
                                                                    )}
                                                                    {isAdministrator && (
                                                                        <EditRecognitionDialog
                                                                            recognition={
                                                                                recognition
                                                                            }
                                                                            onSuccess={
                                                                                refreshData
                                                                            }
                                                                            trigger={
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="text-xs text-orion-blue px-2 h-7"
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            }
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <p className="text-gray-700 text-sm mb-2">
                                                                {
                                                                    recognition.message
                                                                }
                                                            </p>

                                                            <div className="flex gap-4 text-xs text-gray-500">
                                                                <span>
                                                                    {format(
                                                                        new Date(
                                                                            recognition.createdAt,
                                                                        ),
                                                                        'MMM dd, yyyy',
                                                                    )}
                                                                </span>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {recognition.isPublic
                                                                        ? 'Public'
                                                                        : 'Private'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-black font-sans mb-4">
                                    Top Performers
                                </h2>

                                {loading ? (
                                    <div className="text-center flex item-center justify-center py-12">
                                        <Loader2 className="w-10 h-10 animate-spin text-brand" />
                                    </div>
                                ) : leaderboard.length === 0 ? (
                                    <p className="text-center text-gray-500">
                                        No data yet
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {leaderboard.map(
                                            (staff: any, index: number) => (
                                                <Card
                                                    key={staff.staffId || index}
                                                    className="p-3 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-2xl">
                                                            {index === 0 &&
                                                                '🥇'}
                                                            {index === 1 &&
                                                                '🥈'}
                                                            {index === 2 &&
                                                                '🥉'}
                                                            {index > 2 && (
                                                                <span className="text-sm font-semibold text-gray-600">
                                                                    #{index + 1}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="w-10 h-10 rounded-full bg-orion-blue flex items-center justify-center text-white font-bold">
                                                            {
                                                                staff
                                                                    .firstName?.[0]
                                                            }
                                                            {
                                                                staff
                                                                    .lastName?.[0]
                                                            }
                                                        </div>

                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm">
                                                                {
                                                                    staff.firstName
                                                                }{' '}
                                                                {staff.lastName}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {
                                                                    staff.recognitioncount
                                                                }{' '}
                                                                recognition
                                                                {staff.recognitioncount !==
                                                                '1'
                                                                    ? 's'
                                                                    : ''}
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="font-bold text-orion-blue">
                                                                {
                                                                    staff.totalpoints
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                points
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
