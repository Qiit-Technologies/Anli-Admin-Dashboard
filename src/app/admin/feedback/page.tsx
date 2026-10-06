/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
    getFeedback,
    updateFeedback,
    getFeedbackStats,
} from '@/app/actions/feedback';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SelectField, TextAreaField } from '@/components/common/Form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
];

export default function FeedbackPage() {
    const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [responseData, setResponseData] = useState({
        status: '',
        adminResponse: '',
    });
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const fetcher = async ([, category, status]: [string, string, string]) => {
        const filters: any = {};

        if (category && category !== 'all') {
            filters.category = category;
        }
        if (status && status !== 'all') {
            filters.status = status;
        }

        const result = await getFeedback(filters);
        return result.data || [];
    };

    const statsFetcher = async () => {
        const result = await getFeedbackStats();
        return result || {};
    };

    const {
        data: feedbackList = [],
        isLoading: loading,
        mutate: mutateList,
    } = useSWR(['feedback-list', categoryFilter, statusFilter], fetcher, {
        onError: (error) => {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to load feedback';
            toast.error(errorMessage);
        },
    });

    const { data: stats, mutate: mutateStats } = useSWR(
        'feedback-stats',
        statsFetcher,
    );

    const handleViewFeedback = (feedback: any) => {
        setSelectedFeedback(feedback);
        setResponseData({
            status: feedback.status || '',
            adminResponse: feedback.adminResponse || '',
        });
        setDialogOpen(true);
    };

    const handleUpdateFeedback = async () => {
        if (!selectedFeedback) return;

        try {
            await updateFeedback(selectedFeedback.id, responseData);
            toast.success('Feedback updated successfully');
            setDialogOpen(false);
            mutateList();
            mutateStats();
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to update feedback';
            toast.error(errorMessage);
        }
    };

    return (
        <PageWrapper className="px-0">
            <div className="px-2">
                <PageHeader>
                    <PageHeadertitle
                        title="Staff Feedback"
                        subtitle="Review and respond to staff suggestions, complaints, and general feedback"
                    />
                </PageHeader>
            </div>
            <div className="px-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        {/* Stats */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <Card className="p-4 bg-blue-50 border-blue-200">
                                    <p className="text-sm text-gray-600">
                                        Total
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.total || 0}
                                    </p>
                                </Card>
                                <Card className="p-4 bg-purple-50 border-purple-200">
                                    <p className="text-sm text-gray-600">
                                        Suggestions
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats.byCategory?.suggestion || 0}
                                    </p>
                                </Card>
                                <Card className="p-4 bg-orange-50 border-orange-200">
                                    <p className="text-sm text-gray-600">
                                        Complaints
                                    </p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {stats.byCategory?.complaint || 0}
                                    </p>
                                </Card>
                                <Card className="p-4 bg-green-50 border-green-200">
                                    <p className="text-sm text-gray-600">
                                        Resolved
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.byStatus?.resolved || 0}
                                    </p>
                                </Card>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex gap-2 items-center">
                                <span className="text-sm font-medium">
                                    Category:
                                </span>
                                {[
                                    'all',
                                    'suggestion',
                                    'complaint',
                                    'general',
                                ].map((cat) => (
                                    <Button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        variant={
                                            categoryFilter === cat
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                    >
                                        {cat.charAt(0).toUpperCase() +
                                            cat.slice(1)}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="text-sm font-medium">
                                    Status:
                                </span>
                                {['all', 'new', 'in_progress', 'resolved'].map(
                                    (status) => (
                                        <Button
                                            key={status}
                                            onClick={() =>
                                                setStatusFilter(status)
                                            }
                                            variant={
                                                statusFilter === status
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                        >
                                            {status === 'all'
                                                ? 'All'
                                                : status
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                  status
                                                      .slice(1)
                                                      .replace('_', ' ')}
                                        </Button>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Feedback List */}
                        {loading ? (
                            <div className="text-center flex item-center justify-center py-12">
                                <Loader2 className="w-10 h-10 animate-spin text-brand" />
                            </div>
                        ) : feedbackList.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-gray-500">
                                    No feedback found
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {feedbackList.map((feedback: any) => (
                                    <Card
                                        key={feedback.id}
                                        className="p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex gap-2 mb-2">
                                                    <Badge>
                                                        {feedback.category}
                                                    </Badge>
                                                    {feedback.isAnonymous ? (
                                                        <Badge variant="outline">
                                                            Anonymous
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            {
                                                                feedback
                                                                    .submittedBy
                                                                    ?.firstName
                                                            }{' '}
                                                            {
                                                                feedback
                                                                    .submittedBy
                                                                    ?.lastName
                                                            }
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        {feedback.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                </div>

                                                <p className="text-gray-800 mb-2 line-clamp-2">
                                                    {feedback.message}
                                                </p>

                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    <span>
                                                        {format(
                                                            new Date(
                                                                feedback.createdAt,
                                                            ),
                                                            'MMM dd, yyyy HH:mm',
                                                        )}
                                                    </span>
                                                    {feedback.department && (
                                                        <span>
                                                            {
                                                                feedback.department
                                                            }
                                                        </span>
                                                    )}
                                                    <span>#{feedback.id}</span>
                                                </div>

                                                {feedback.adminResponse && (
                                                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                                        <p className="text-xs font-semibold text-green-900 mb-1">
                                                            Admin Response:
                                                        </p>
                                                        <p className="text-sm text-green-800 line-clamp-1">
                                                            {
                                                                feedback.adminResponse
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={() =>
                                                    handleViewFeedback(feedback)
                                                }
                                                variant="outline"
                                            >
                                                Review
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
                        <DialogTitle>
                            Feedback #{selectedFeedback?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedFeedback && (
                        <div className="space-y-4 px-6 py-4 overflow-y-auto flex-1">
                            {/* Badges */}
                            <div className="flex gap-2">
                                <Badge>{selectedFeedback.category}</Badge>
                                {selectedFeedback.isAnonymous ? (
                                    <Badge variant="outline">Anonymous</Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {
                                            selectedFeedback.submittedBy
                                                ?.firstName
                                        }{' '}
                                        {selectedFeedback.submittedBy?.lastName}
                                    </Badge>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Message
                                </label>
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="whitespace-pre-wrap">
                                        {selectedFeedback.message}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold">
                                        Submitted:
                                    </span>{' '}
                                    {format(
                                        new Date(selectedFeedback.createdAt),
                                        'MMM dd, yyyy HH:mm',
                                    )}
                                </div>
                                {selectedFeedback.department && (
                                    <div>
                                        <span className="font-semibold">
                                            Department:
                                        </span>{' '}
                                        {selectedFeedback.department}
                                    </div>
                                )}
                            </div>

                            {/* Status Update */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Update Status
                                </label>
                                <SelectField
                                    id="status"
                                    name="status"
                                    label=""
                                    value={responseData.status}
                                    onValueChange={(value) =>
                                        setResponseData({
                                            ...responseData,
                                            status: value,
                                        })
                                    }
                                    options={STATUS_OPTIONS}
                                />
                            </div>

                            {/* Admin Response */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Admin Response
                                </label>
                                <TextAreaField
                                    id="adminResponse"
                                    name="adminResponse"
                                    label=""
                                    value={responseData.adminResponse}
                                    onChange={(e) =>
                                        setResponseData({
                                            ...responseData,
                                            adminResponse: e.target.value,
                                        })
                                    }
                                    placeholder="Provide your response or update..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 justify-end px-6 py-4 border-t bg-gray-50 mt-auto">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-orion-blue hover:from-orion-blue/90 hover:to-blue-600/90 text-white font-semibold shadow-md"
                            onClick={handleUpdateFeedback}
                        >
                            Update Feedback
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
