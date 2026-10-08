'use client';

import { useEffect, useMemo, useState } from 'react';
import { getFeedback } from '@/app/actions/feedback';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SubmitFeedbackDialog } from '@/components/feedback/SubmitFeedbackDialog';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useUser } from '@/context/useUser';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
    new: 'New',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
};

const STATUS_VARIANTS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-purple-100 text-purple-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-200 text-gray-700',
};

const CATEGORY_LABELS: Record<string, string> = {
    whistleblowing: 'Whistleblowing',
    suggestion: 'Suggestion',
    complaint: 'Complaint',
    general: 'General',
};

const PRIORITY_LABELS: Record<string, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
};

const PRIORITY_VARIANTS: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-emerald-100 text-emerald-700',
};

interface MyFeedbackHistoryProps {
    heading?: string;
    subheading?: string;
    showBackLink?: boolean;
    backLinkHref?: string;
    showHeader?: boolean;
    showSubmitButton?: boolean;
    className?: string;
    contentClassName?: string;
}

export function MyFeedbackHistory({
    heading = 'My Feedback',
    subheading = 'Track the status of your submissions',
    showBackLink = false,
    backLinkHref = '/',
    showHeader = true,
    showSubmitButton = true,
    className = '',
    contentClassName = '',
}: MyFeedbackHistoryProps) {
    const { user } = useUser();
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const loadFeedbacks = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const result = await getFeedback({
                submittedById: user.id,
                limit: 50,
            });
            setFeedbacks(result?.data ?? result ?? []);
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to load feedback history';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeedbacks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const placeholder = useMemo(
        () => (
            <Card className="p-10 text-center text-gray-500">
                <p>You have not submitted any feedback yet.</p>
                <p className="text-sm mt-2">
                    Use the button above to share suggestions, complaints, or
                    whistleblowing reports.
                </p>
            </Card>
        ),
        [],
    );

    return (
        <div className={className}>
            {showHeader && (
                <div className="px-2">
                    <PageHeader>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full">
                            <PageHeadertitle
                                title={heading}
                                subtitle={subheading}
                            />
                            {showSubmitButton && (
                                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                                    {showBackLink && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link href={backLinkHref}>
                                                Back
                                            </Link>
                                        </Button>
                                    )}
                                    <Button
                                        className="bg-orion-blue hover:bg-orion-blue/90 text-white w-full sm:w-auto"
                                        onClick={() => setDialogOpen(true)}
                                    >
                                        Submit Feedback
                                    </Button>
                                </div>
                            )}
                        </div>
                    </PageHeader>
                </div>
            )}

            <div className={`${showHeader ? 'px-2' : ''} ${contentClassName}`}>
                {loading ? (
                    <Card className="p-10 text-center text-gray-500">
                        Loading feedback history...
                    </Card>
                ) : feedbacks.length === 0 ? (
                    placeholder
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => {
                            const statusClass =
                                STATUS_VARIANTS[feedback.status] ||
                                'bg-gray-200 text-gray-700';
                            const priorityClass =
                                PRIORITY_VARIANTS[feedback.priority] ||
                                'bg-gray-200 text-gray-700';
                            const created =
                                feedback.createdAt &&
                                format(
                                    new Date(feedback.createdAt),
                                    'MMM d, yyyy • h:mm a',
                                );
                            const updated =
                                feedback.updatedAt &&
                                format(
                                    new Date(feedback.updatedAt),
                                    'MMM d, yyyy • h:mm a',
                                );

                            return (
                                <Card
                                    key={feedback.id}
                                    className="p-4 border border-gray-100 shadow-sm"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-wrap gap-2 items-center justify-between">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge
                                                    className={`text-xs ${statusClass}`}
                                                >
                                                    {STATUS_LABELS[
                                                        feedback.status
                                                    ] ?? feedback.status}
                                                </Badge>
                                                <Badge
                                                    className={`text-xs ${priorityClass}`}
                                                >
                                                    {PRIORITY_LABELS[
                                                        feedback.priority
                                                    ] ?? feedback.priority}
                                                </Badge>
                                                <Badge variant="secondary">
                                                    {CATEGORY_LABELS[
                                                        feedback.category
                                                    ] ?? feedback.category}
                                                </Badge>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                #{feedback.id}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-800 whitespace-pre-line">
                                            {feedback.message}
                                        </p>

                                        <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                                            {created && (
                                                <span>
                                                    Submitted: {created}
                                                </span>
                                            )}
                                            {updated && (
                                                <span>
                                                    Last update: {updated}
                                                </span>
                                            )}
                                            {feedback.department && (
                                                <span>
                                                    Dept: {feedback.department}
                                                </span>
                                            )}
                                        </div>

                                        {feedback.adminResponse && (
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                                                <p className="text-xs uppercase text-gray-500 font-semibold mb-1">
                                                    Admin Response
                                                </p>
                                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                                    {feedback.adminResponse}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {showSubmitButton && (
                <SubmitFeedbackDialog
                    open={dialogOpen}
                    onSubmitSuccess={loadFeedbacks}
                    onOpenChange={(open) => setDialogOpen(open)}
                />
            )}
        </div>
    );
}
