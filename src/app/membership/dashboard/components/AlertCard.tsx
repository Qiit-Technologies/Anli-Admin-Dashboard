import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/helpers';
import { X } from 'lucide-react';
import React from 'react';
import { FaCodepen } from 'react-icons/fa';

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

interface AlertCardProps {
    alert: ExpiryAlert;
    onDismiss?: (alertId: string) => void;
    onRenewNow?: (alert: ExpiryAlert) => void;
    onViewProfile?: (alert: ExpiryAlert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
    alert,
    onDismiss,
    onRenewNow,
    onViewProfile,
}) => {
    return (
        <div className="p-4 shadow-sm border rounded-md text-sm flex flex-row gap-3">
            <FaCodepen size={24} color="#475467" />
            <div className="flex-1">
                <p className="font-medium text-sm mb-3">Upcoming Renewal</p>
                <p className="text-sm font-normal text-[#667085] mb-3">
                    {alert.name} {alert.tier ? `(${alert.tier})` : ''}{' '}
                    Membership expires in {alert.daysUntilExpiry} days
                </p>
                <p className="text-[#96250B] text-xs font-normal mb-3">
                    Expiry Date: {formatDate(alert.expiryDate)}
                </p>
                <div className="flex justify-start gap-3 mt-3 text-[#667085] text-sm">
                    <Button
                        className="cursor-pointer text-[#40545F] border bg-[#E1E1E1] hover:bg-[#D0D0D0] p-2 rounded-md shadow-none text-sm"
                        onClick={() => onRenewNow?.(alert)}
                    >
                        Renew Now
                    </Button>
                    <Button
                        className="cursor-pointer p-2 rounded-md shadow-none border hover:bg-[#FF9933] text-xs font-medium bg-[#FF9933] text-white"
                        onClick={() => onViewProfile?.(alert)}
                    >
                        View Profile
                    </Button>
                </div>
            </div>
            <X
                size={24}
                color="#667085"
                className="cursor-pointer"
                onClick={() => onDismiss?.(alert.id)}
            />
        </div>
    );
};

export default AlertCard;
