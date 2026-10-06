'use client';

import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { ManagerPinDialog } from '@/components/stock/common/modal/ManagerPinDialog';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    getRequisitionApprovals,
    updateStockRequestItems,
} from '@/app/actions/inventory';
import {
    Calendar,
    CheckCircle,
    Clock,
    Loader2,
    Package,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

interface RequisitionRequest {
    id: number;
    department: string;
    requestedBy: string;
    requestedById: number;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AWAITING_ADMIN_APPROVAL';
    items: {
        id: number;
        name: string;
        quantity: number;
        unitOfMeasurement: string;
    }[];
    rejectionReason?: string;
}

const RequisitionApprovalsPage = () => {
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [pinRequestId, setPinRequestId] = useState<number | null>(null);

    const fetcher = async () => {
        const response = await getRequisitionApprovals();
        if (response.error) throw new Error(response.error);
        return response.data || [];
    };

    const {
        data: requests = [],
        isLoading: loading,
        mutate,
    } = useSWR<RequisitionRequest[]>('requisition-approvals', fetcher, {
        onError: () => {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to fetch requisition approvals"
                    type="error"
                />
            ));
        },
    });

    const handleApproveWithPin = async (pin: string) => {
        if (pinRequestId == null) return;
        const requestId = pinRequestId;
        setActionLoading(requestId);
        try {
            const response = await updateStockRequestItems(
                requestId.toString(),
                'APPROVED',
                undefined,
                undefined,
                undefined,
                undefined,
                pin,
            );
            const ok =
                response.message ===
                    'Stock request items updated successfully!' ||
                response.message ===
                    'Stock request approved with manager PIN!';
            if (ok) {
                mutate(
                    (currentData: RequisitionRequest[] | undefined) =>
                        currentData?.map((req: RequisitionRequest) =>
                            req.id === requestId
                                ? { ...req, status: 'APPROVED' as const }
                                : req,
                        ),
                    false,
                );

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Requisition request approved successfully!"
                        type="success"
                    />
                ));
                setPinRequestId(null);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.message ||
                            'Invalid PIN or approval failed.'
                        }
                        type="error"
                    />
                ));
            }
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to approve request. Please try again."
                    type="error"
                />
            ));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (requestId: number, reason: string) => {
        setActionLoading(requestId);
        try {
            const response = await updateStockRequestItems(
                requestId.toString(),
                'REJECTED',
                reason,
            );
            if (
                response.message === 'Stock request items updated successfully!'
            ) {
                mutate(
                    (currentData: RequisitionRequest[] | undefined) =>
                        currentData?.map((req: RequisitionRequest) =>
                            req.id === requestId
                                ? {
                                      ...req,
                                      status: 'REJECTED' as const,
                                      rejectionReason: reason,
                                  }
                                : req,
                        ),
                    false,
                );

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Requisition request rejected successfully!"
                        type="success"
                    />
                ));
            } else {
                throw new Error(response.message);
            }
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to reject request. Please try again."
                    type="error"
                />
            ));
        } finally {
            setActionLoading(null);
        }
    };

    const pendingRequests = requests.filter((req) =>
        ['PENDING', 'AWAITING_ADMIN_APPROVAL'].includes(req.status),
    );
    const approvedRequests = requests.filter((req) =>
        ['APPROVED'].includes(req.status),
    );
    const rejectedRequests = requests.filter((req) =>
        ['REJECTED'].includes(req.status),
    );

    // const getStatusBadge = (status: string) => {
    //     switch (status) {
    //         case 'PENDING':
    //             return (
    //                 <Badge
    //                     variant="outline"
    //                     className="text-yellow-600 border-yellow-600"
    //                 >
    //                     <Clock className="w-3 h-3 mr-1" />
    //                     Pending
    //                 </Badge>
    //             );
    //         case 'APPROVED':
    //             return (
    //                 <Badge
    //                     variant="outline"
    //                     className="text-green-600 border-green-600"
    //                 >
    //                     <CheckCircle className="w-3 h-3 mr-1" />
    //                     Approved
    //                 </Badge>
    //             );
    //         case 'REJECTED':
    //             return (
    //                 <Badge
    //                     variant="outline"
    //                     className="text-red-600 border-red-600"
    //                 >
    //                     <XCircle className="w-3 h-3 mr-1" />
    //                     Rejected
    //                 </Badge>
    //             );
    //         default:
    //             return <Badge variant="outline">{status}</Badge>;
    //     }
    // };

    if (loading) {
        return (
            <PageWrapper>
                <PageHeader>
                    <PageHeadertitle title="Requisition Approvals" />
                </PageHeader>
                <div className="text-center flex flex-col h-[80vh] items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-brand" />
                    Loading. Please wait...
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle title="Requisition Approvals" />
            </PageHeader>

            <ManagerPinDialog
                open={pinRequestId != null}
                onOpenChange={(open) => {
                    if (!open) setPinRequestId(null);
                }}
                isLoading={actionLoading === pinRequestId}
                onConfirm={handleApproveWithPin}
            />

            <div className="space-y-6">
                {/* Requests Tabs */}
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">
                            Pending ({pendingRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="approved">
                            Approved ({approvedRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="rejected">
                            Rejected ({rejectedRequests.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingRequests.length === 0 ? (
                            <Card className="border border-gray-200">
                                <CardContent className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">
                                            No pending requisition requests
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            pendingRequests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onApprove={setPinRequestId}
                                    onReject={handleReject}
                                    loading={actionLoading === request.id}
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="space-y-4">
                        {approvedRequests.length === 0 ? (
                            <Card className="border border-gray-200">
                                <CardContent className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">
                                            No approved requisition requests
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            approvedRequests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onApprove={setPinRequestId}
                                    onReject={handleReject}
                                    loading={false}
                                    readOnly
                                />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="rejected" className="space-y-4">
                        {rejectedRequests.length === 0 ? (
                            <Card className="border border-gray-200">
                                <CardContent className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <XCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <p className="text-gray-500">
                                            No rejected requisition requests
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            rejectedRequests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onApprove={setPinRequestId}
                                    onReject={handleReject}
                                    loading={false}
                                    readOnly
                                />
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </PageWrapper>
    );
};

interface RequestCardProps {
    request: RequisitionRequest;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
    loading: boolean;
    readOnly?: boolean;
}

const RequestCard = ({
    request,
    onApprove,
    onReject,
    loading,
    readOnly = false,
}: RequestCardProps) => {
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleRejectSubmit = () => {
        if (rejectionReason.trim()) {
            onReject(request.id, rejectionReason);
            setShowRejectForm(false);
            setRejectionReason('');
        }
    };

    return (
        <Card
            className={`border shadow-sm hover:shadow-md transition-shadow ${['PENDING', 'AWAITING_ADMIN_APPROVAL'].includes(request.status)
                ? ' '
                : 'border-gray-200'
                }`}
        >
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${[
                                    'PENDING',
                                    'AWAITING_ADMIN_APPROVAL',
                                ].includes(request.status)
                                    ? 'bg-amber-100'
                                    : 'bg-gray-100'
                                    }`}
                            >
                                <Package
                                    className={`w-4 h-4 ${[
                                        'PENDING',
                                        'AWAITING_ADMIN_APPROVAL',
                                    ].includes(request.status)
                                        ? 'text-amber-600'
                                        : 'text-gray-600'
                                        }`}
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Request #{request.id}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {request.department} • {request.requestedBy}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 ml-11">
                            <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(request.date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {getStatusBadge(request.status)}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Requested Items
                        </h4>
                        <div className="space-y-2">
                            {request.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                        <span className="font-medium text-gray-900">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-600 font-medium">
                                        {item.quantity} {item.unitOfMeasurement}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {request.rejectionReason && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-300 rounded-r-lg">
                            <h4 className="text-sm font-medium text-red-800 mb-1">
                                Rejection Reason
                            </h4>
                            <p className="text-sm text-red-700">
                                {request.rejectionReason}
                            </p>
                        </div>
                    )}

                    {!readOnly &&
                        ['PENDING', 'AWAITING_ADMIN_APPROVAL'].includes(
                            request.status,
                        ) && (
                            <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                <Button
                                    onClick={() => onApprove(request.id)}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                                >
                                    {loading ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setShowRejectForm(!showRejectForm)
                                    }
                                    disabled={loading}
                                    className="border-red-300 text-red-700 hover:bg-red-50 px-6"
                                >
                                    Reject
                                </Button>
                            </div>
                        )}

                    {showRejectForm && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Rejection Reason
                            </h4>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) =>
                                    setRejectionReason(e.target.value)
                                }
                                placeholder="Enter reason for rejection..."
                                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                rows={3}
                            />
                            <div className="flex space-x-3">
                                <Button
                                    onClick={handleRejectSubmit}
                                    disabled={
                                        !rejectionReason.trim() || loading
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white px-6"
                                >
                                    {loading
                                        ? 'Rejecting...'
                                        : 'Submit Rejection'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectionReason('');
                                    }}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'PENDING':
            return (
                <Badge
                    variant="outline"
                    className="text-amber-700 border-amber-300 bg-amber-50"
                >
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                </Badge>
            );
        case 'AWAITING_ADMIN_APPROVAL':
            return (
                <Badge
                    variant="outline"
                    className="text-orange-700 border-orange-300 bg-orange-50"
                >
                    <Clock className="w-3 h-3 mr-1" />
                    Awaiting Admin Approval
                </Badge>
            );
        case 'APPROVED':
            return (
                <Badge
                    variant="outline"
                    className="text-green-700 border-green-300 bg-green-50"
                >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                </Badge>
            );
        case 'REJECTED':
            return (
                <Badge
                    variant="outline"
                    className="text-red-700 border-red-300 bg-red-50"
                >
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejected
                </Badge>
            );
        default:
            return (
                <Badge
                    variant="outline"
                    className="text-gray-600 border-gray-300"
                >
                    {status}
                </Badge>
            );
    }
};

export default RequisitionApprovalsPage;
