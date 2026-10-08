/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import {
    getAdminReviews,
    respondToAdminReview,
    hideAdminReview,
    publishAdminReview,
    type AdminReview,
} from '@/app/actions/reviews';
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
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Loader2, MessageSquareReply, EyeOff, Eye } from 'lucide-react';

type Filter = 'published' | 'hidden' | 'all';

function Stars({ value }: { value: number }) {
    return (
        <span className="text-amber-400 text-sm">
            {'★'.repeat(value)}
            <span className="text-gray-300">{'★'.repeat(5 - value)}</span>
        </span>
    );
}

export default function ReviewsPage() {
    const [filter, setFilter] = useState<Filter>('published');
    const { data, isLoading } = useSWR(['admin-reviews', filter], () =>
        getAdminReviews(filter === 'all' ? undefined : filter),
    );
    const [replying, setReplying] = useState<AdminReview | null>(null);
    const [response, setResponse] = useState('');
    const [saving, setSaving] = useState(false);

    const reviews: AdminReview[] = data?.data?.data ?? [];

    const refresh = () => mutate(['admin-reviews', filter]);

    const sendReply = async () => {
        if (!replying || response.trim().length < 2) {
            toast.error('Write a reply first.');
            return;
        }
        setSaving(true);
        const res = await respondToAdminReview(replying.id, response.trim());
        setSaving(false);
        if (res.error) toast.error(res.error);
        else {
            toast.success('Reply posted.');
            setReplying(null);
            setResponse('');
            refresh();
        }
    };

    const toggleVisibility = async (r: AdminReview) => {
        const res =
            r.status === 'published'
                ? await hideAdminReview(r.id)
                : await publishAdminReview(r.id);
        if (res.error) toast.error(res.error);
        else {
            toast.success(
                r.status === 'published' ? 'Review hidden.' : 'Review published.',
            );
            refresh();
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Reviews"
                    subtitle="Moderate diner reviews and post restaurant replies"
                />
            </PageHeader>

            <div className="flex gap-2 mb-6">
                {(['published', 'hidden', 'all'] as Filter[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium rounded-full capitalize ${
                            filter === f
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <Card className="p-5">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin" />
                    </div>
                ) : reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        No {filter === 'all' ? '' : filter} reviews.
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {reviews.map((r) => (
                            <div
                                key={r.id}
                                className="border rounded-2xl p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-medium">
                                            {r.restaurant?.name ??
                                                `#${r.restaurantId}`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Stars value={r.rating} />
                                            <span className="text-xs text-gray-500">
                                                {r.reviewerName} ·{' '}
                                                {format(
                                                    new Date(r.createdAt),
                                                    'dd MMM yyyy',
                                                )}
                                            </span>
                                            <Badge
                                                variant={
                                                    r.status === 'published'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="capitalize"
                                            >
                                                {r.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setReplying(r);
                                                setResponse(r.response ?? '');
                                            }}
                                        >
                                            <MessageSquareReply className="h-4 w-4 mr-1" />
                                            {r.response ? 'Edit reply' : 'Reply'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleVisibility(r)}
                                        >
                                            {r.status === 'published' ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                {r.title && (
                                    <p className="font-semibold text-sm mt-2">
                                        {r.title}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 mt-1">
                                    {r.body}
                                </p>
                                {r.response && (
                                    <div className="mt-2 rounded-xl bg-orange-50 px-3 py-2">
                                        <p className="text-xs font-semibold text-orange-700">
                                            Restaurant reply
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {r.response}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Dialog open={!!replying} onOpenChange={() => setReplying(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Reply to review — {replying?.restaurant?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-600 mb-3">
                        <Stars value={replying?.rating ?? 0} />{' '}
                        <span className="italic">“{replying?.body}”</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="Write the restaurant's public reply…"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                        />
                        <Button onClick={sendReply} disabled={saving}>
                            {saving ? (
                                <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                                'Post reply'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
