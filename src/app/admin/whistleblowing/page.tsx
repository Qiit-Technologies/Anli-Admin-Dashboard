/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getFeedback, updateFeedback } from '@/app/actions/feedback';
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

export default function WhistleblowingPage() {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<any | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [responseData, setResponseData] = useState({
        status: '',
        adminResponse: '',
    });

    const fetcher = async ([, status]: [string, string]) => {
        const filters: any = { category: 'whistleblowing' };

        if (status && status !== 'all') {
            filters.status = status;
        }

        const result = await getFeedback(filters);
        return result.data || [];
    };

    const {
        data: reports = [],
        isLoading: loading,
        mutate,
    } = useSWR(['whistleblowing-reports', filterStatus], fetcher, {
        onError: (error) => {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to load reports';
            toast.error(errorMessage);
        },
    });

    const handleViewReport = (report: any) => {
        setSelectedReport(report);
        setResponseData({
            status: report.status || '',
            adminResponse: report.adminResponse || '',
        });
        setDialogOpen(true);
    };

    const handleUpdateReport = async () => {
        if (!selectedReport) return;

        try {
            await updateFeedback(selectedReport.id, responseData);
            toast.success('Report updated successfully');
            setDialogOpen(false);
            mutate();
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to update report';
            toast.error(errorMessage);
        }
    };

    const urgentCount = reports.filter(
        (r: any) => r.priority === 'urgent',
    ).length;
    const newCount = reports.filter((r: any) => r.status === 'new').length;

    return (
        <PageWrapper className="px-0">
            <div className="px-2">
                <PageHeader>
                    <PageHeadertitle
                        title="Whistleblowing Reports"
                        subtitle="Confidential staff reports - Handle with strict confidentiality"
                    />
                </PageHeader>
            </div>
            <div className="px-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card className="p-4 bg-red-50 border-red-200">
                                <p className="text-sm text-gray-600">Urgent</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {urgentCount}
                                </p>
                            </Card>
                            <Card className="p-4 bg-blue-50 border-blue-200">
                                <p className="text-sm text-gray-600">New</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {newCount}
                                </p>
                            </Card>
                            <Card className="p-4 bg-yellow-50 border-yellow-200">
                                <p className="text-sm text-gray-600">
                                    In Progress
                                </p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {
                                        reports.filter(
                                            (r: any) =>
                                                r.status === 'in_progress',
                                        ).length
                                    }
                                </p>
                            </Card>
                            <Card className="p-4 bg-green-50 border-green-200">
                                <p className="text-sm text-gray-600">
                                    Resolved
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {
                                        reports.filter(
                                            (r: any) => r.status === 'resolved',
                                        ).length
                                    }
                                </p>
                            </Card>
                        </div>

                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                'all',
                                'new',
                                'under_review',
                                'in_progress',
                                'resolved',
                            ].map((status) => (
                                <Button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    variant={
                                        filterStatus === status
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                >
                                    {status === 'all'
                                        ? 'All'
                                        : status.charAt(0).toUpperCase() +
                                          status.slice(1).replace('_', ' ')}
                                </Button>
                            ))}
                        </div>

                        {/* Reports List */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-24">
                                <Loader2 className="w-10 h-10 animate-spin text-brand" />
                            </div>
                        ) : reports.length === 0 ? (
                            <Card className="p-12 text-center">
                                <p className="text-gray-500">
                                    No reports found
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report: any) => (
                                    <Card
                                        key={report.id}
                                        className="p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex gap-2 mb-2">
                                                    <Badge className="bg-red-600 text-white">
                                                        Whistleblowing
                                                    </Badge>
                                                    <Badge
                                                        variant={
                                                            report.priority ===
                                                            'urgent'
                                                                ? 'destructive'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {report.priority}
                                                    </Badge>
                                                    <Badge variant="secondary">
                                                        {report.status.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        Anonymous
                                                    </Badge>
                                                </div>

                                                <p className="text-gray-800 mb-2 line-clamp-2">
                                                    {report.message}
                                                </p>

                                                <div className="flex gap-4 text-sm text-gray-500">
                                                    <span>
                                                        {format(
                                                            new Date(
                                                                report.createdAt,
                                                            ),
                                                            'MMM dd, yyyy HH:mm',
                                                        )}
                                                    </span>
                                                    {report.department && (
                                                        <span>
                                                            Dept:{' '}
                                                            {report.department}
                                                        </span>
                                                    )}
                                                    <span>
                                                        ID: #{report.id}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() =>
                                                    handleViewReport(report)
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
                            Whistleblowing Report #{selectedReport?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedReport && (
                        <div className="space-y-4 px-6 py-4 overflow-y-auto flex-1">
                            {/* Privacy Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-900 font-medium">
                                    🔒 This report was submitted anonymously. No
                                    identifying information is available.
                                </p>
                            </div>

                            {/* Badges */}
                            <div className="flex gap-2">
                                <Badge className="bg-red-600 text-white">
                                    Whistleblowing
                                </Badge>
                                <Badge>{selectedReport.priority}</Badge>
                                <Badge variant="outline">
                                    {selectedReport.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Report Details
                                </label>
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="whitespace-pre-wrap">
                                        {selectedReport.message}
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
                                        new Date(selectedReport.createdAt),
                                        'MMM dd, yyyy HH:mm',
                                    )}
                                </div>
                                {selectedReport.department && (
                                    <div>
                                        <span className="font-semibold">
                                            Department:
                                        </span>{' '}
                                        {selectedReport.department}
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
                                    placeholder="Document your investigation and actions..."
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
                            onClick={handleUpdateReport}
                        >
                            Update Report
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </PageWrapper>
    );
}
