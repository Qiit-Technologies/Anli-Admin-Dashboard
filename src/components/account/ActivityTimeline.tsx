'use client';
import React from 'react';
import {
    PurchaseOrderActivity,
    PurchaseOrderStage,
} from '@/types/purchase-order';
import { format } from 'date-fns';
import { CheckCircle2, Clock, User } from 'lucide-react';

interface ActivityTimelineProps {
    activities: PurchaseOrderActivity[];
}

const stageColors = {
    [PurchaseOrderStage.CREATED]: {
        bg: '#EBF8FF',
        text: '#1E40AF',
        icon: '#3B82F6',
    },
    [PurchaseOrderStage.APPROVED]: {
        bg: '#F0FDF4',
        text: '#166534',
        icon: '#22C55E',
    },
    [PurchaseOrderStage.SUPPLIED]: {
        bg: '#FEF3C7',
        text: '#92400E',
        icon: '#F59E0B',
    },
    [PurchaseOrderStage.COMPLETED]: {
        bg: '#F3E8FF',
        text: '#7C3AED',
        icon: '#8B5CF6',
    },
    [PurchaseOrderStage.PAID]: {
        bg: '#ECFDF5',
        text: '#065F46',
        icon: '#10B981',
    },
};

const stageLabels = {
    [PurchaseOrderStage.CREATED]: 'Created',
    [PurchaseOrderStage.APPROVED]: 'Approved',
    [PurchaseOrderStage.SUPPLIED]: 'Supplied',
    [PurchaseOrderStage.COMPLETED]: 'Completed',
    [PurchaseOrderStage.PAID]: 'Paid',
};

export default function ActivityTimeline({
    activities,
}: ActivityTimelineProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>No activities recorded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Timeline
            </h3>
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {activities.map((activity) => {
                    const stageColor = stageColors[activity.stage];

                    return (
                        <div
                            key={activity.id}
                            className="relative flex items-start space-x-4 pb-6"
                        >
                            {/* Timeline dot */}
                            <div
                                className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: stageColor.icon }}
                            >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: stageColor.bg,
                                                color: stageColor.text,
                                            }}
                                        >
                                            {stageLabels[activity.stage]}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {format(
                                                new Date(activity.createdAt),
                                                'MMM dd, yyyy h:mm a',
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {activity.remarks && (
                                    <p className="mt-1 text-sm text-gray-700">
                                        {activity.remarks}
                                    </p>
                                )}

                                {activity.updatedBy && (
                                    <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                                        <User className="w-3 h-3" />
                                        <span>
                                            Updated by{' '}
                                            {activity.updatedBy.fullName}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
