import React from 'react';
import {
    User,
    Calendar,
    DollarSign,
    CreditCard,
    MapPin,
    Star,
} from 'lucide-react';

interface GuestProfileCardProps {
    guest: {
        fullName: string;
        email?: string;
        phoneNumber?: string;
        address?: string;
        totalStays?: number;
        totalSpent?: number;
        averageStayLength?: number;
        preferredPaymentMethod?: string;
        preferredRoomType?: string;
        lastStayDate?: string;
        loyaltyPoints?: number;
        specialRequests?: string;
    };
    onSelect: () => void;
    isSelected?: boolean;
}

export const GuestProfileCard: React.FC<GuestProfileCardProps> = ({
    guest,
    onSelect,
    isSelected = false,
}) => {
    return (
        <div
            onClick={onSelect}
            className={`
        p-4 border rounded-lg cursor-pointer transition-all duration-200
        ${
            isSelected
                ? 'border-orion-blue bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-orion-blue hover:shadow-md'
        }
      `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orion-blue rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {guest.fullName}
                        </h3>
                        {guest.email && (
                            <p className="text-sm text-gray-600">
                                {guest.email}
                            </p>
                        )}
                    </div>
                </div>
                {guest.totalStays && guest.totalStays > 0 && (
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                        <Star className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                            {guest.totalStays} stays
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {guest.totalStays && guest.totalStays > 0 && (
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Total Stays</p>
                            <p className="text-sm font-medium text-gray-900">
                                {guest.totalStays}
                            </p>
                        </div>
                    </div>
                )}

                {guest.totalSpent && guest.totalSpent > 0 && (
                    <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Total Spent</p>
                            <p className="text-sm font-medium text-gray-900">
                                ${guest.totalSpent.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {guest.averageStayLength && guest.averageStayLength > 0 && (
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">Avg. Stay</p>
                            <p className="text-sm font-medium text-gray-900">
                                {guest.averageStayLength} nights
                            </p>
                        </div>
                    </div>
                )}

                {guest.loyaltyPoints && guest.loyaltyPoints > 0 && (
                    <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500">
                                Loyalty Points
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                                {guest.loyaltyPoints}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Preferences */}
            {(guest.preferredPaymentMethod || guest.preferredRoomType) && (
                <div className="border-t pt-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                        Preferences
                    </h4>
                    <div className="space-y-1">
                        {guest.preferredPaymentMethod && (
                            <div className="flex items-center space-x-2">
                                <CreditCard className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                    {guest.preferredPaymentMethod}
                                </span>
                            </div>
                        )}
                        {guest.preferredRoomType && (
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span className="text-xs text-gray-600">
                                    {guest.preferredRoomType}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Last Stay */}
            {guest.lastStayDate && (
                <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-gray-500">Last stay</p>
                    <p className="text-sm font-medium text-gray-900">
                        {new Date(guest.lastStayDate).toLocaleDateString()}
                    </p>
                </div>
            )}

            {/* Special Requests */}
            {guest.specialRequests && (
                <div className="border-t pt-3 mt-3">
                    <p className="text-xs text-gray-500">Special Requests</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                        {guest.specialRequests}
                    </p>
                </div>
            )}
        </div>
    );
};

export default GuestProfileCard;
