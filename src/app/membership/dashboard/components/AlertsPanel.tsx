import { Codepen, Loader2 } from 'lucide-react';
import React from 'react';
import AlertCard from './AlertCard';

interface ExpiryAlert {
    id: string;
    name: string;
    tier: string;
    expiryDate: string;
    daysUntilExpiry: number;
    planId: string;
    planName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
}

interface AlertsPanelProps {
    loading: boolean;
    expiryAlerts: ExpiryAlert[];
    onDismissAlert?: (alertId: string) => void;
    onRenewNow?: (alert: ExpiryAlert) => void;
    onViewProfile?: (alert: ExpiryAlert) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({
    loading,
    expiryAlerts,
    onDismissAlert,
    onRenewNow,
    onViewProfile,
}) => {
    return (
        <div className="bg-white p-4 rounded-lg w-full shadow-sm border max-h-[400px]  overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-[#263238]">
                    Alerts Panel
                </h3>
                <span
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-500 text-white text-xs font-medium"
                    title="Expired members"
                >
                    {expiryAlerts.length}
                </span>
            </div>
            <div className="overflow-y-auto space-y-4 h-full">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading alerts...
                        </div>
                    </div>
                ) : expiryAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <Codepen
                            size={32}
                            color="#D1D5DB"
                            className="mx-auto mb-3"
                        />
                        <p className="text-sm text-gray-500 mb-1">
                            No upcoming renewals
                        </p>
                        <p className="text-xs text-gray-400">
                            All memberships are up to date
                        </p>
                    </div>
                ) : (
                    expiryAlerts.map((alert, i) => (
                        <AlertCard
                            key={alert.id || i}
                            alert={alert}
                            onDismiss={onDismissAlert}
                            onRenewNow={onRenewNow}
                            onViewProfile={onViewProfile}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsPanel;
