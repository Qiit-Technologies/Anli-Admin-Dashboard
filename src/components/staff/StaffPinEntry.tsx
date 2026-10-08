'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { MdChevronLeft } from 'react-icons/md';

interface StaffPinEntryProps {
    staff: {
        id: number;
        name: string;
        role: string;
        profileImage?: string;
    };
    onPinSubmit: (pin: string) => void;
    onBack: () => void;
    isLoading?: boolean;
}

export function StaffPinEntry({
    staff,
    onPinSubmit,
    onBack,
    isLoading = false,
}: StaffPinEntryProps) {
    const [pin, setPin] = useState<string[]>(['', '', '', '']);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNumberClick = (num: string) => {
        if (currentIndex < 4) {
            const newPin = [...pin];
            newPin[currentIndex] = num;
            setPin(newPin);

            if (currentIndex < 3) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // All 4 digits entered, auto-submit
                const completePin = newPin.join('');
                setTimeout(() => {
                    onPinSubmit(completePin);
                }, 100);
            }
        }
    };

    const handleBackspace = () => {
        // Find the last filled PIN digit and remove it
        const lastFilledIndex = pin.findLastIndex((digit) => digit !== '');
        if (lastFilledIndex !== -1) {
            const newPin = [...pin];
            newPin[lastFilledIndex] = '';
            setPin(newPin);
            setCurrentIndex(Math.max(0, lastFilledIndex));
        }
    };

    const handleLogin = () => {
        const completePin = pin.join('');
        if (completePin.length === 4) {
            onPinSubmit(completePin);
        }
    };

    const getInitialsFromName = () => getInitials(staff.name);

    // Generate color based on role for avatar background
    const getAvatarColor = (role: string): string => {
        const roleLower = role.toLowerCase();
        const colors: Record<string, string> = {
            manager: 'bg-blue-500',
            administrator: 'bg-purple-500',
            waiter: 'bg-orange-500',
            waitress: 'bg-orange-500',
            chef: 'bg-red-500',
            headchef: 'bg-red-500',
            housekeeping: 'bg-green-500',
            housekeeper: 'bg-green-500',
            frontoffice: 'bg-pink-500',
            kitchen: 'bg-indigo-500',
            supervisor: 'bg-yellow-500',
            barmanager: 'bg-amber-500',
            stock: 'bg-teal-500',
            account: 'bg-indigo-500',
            backofhouse: 'bg-blue',
            back_of_house: 'bg-blue',
            front_office: 'bg-blue',
            front_of_house: 'bg-blue',
            bar: 'bg-blue',
            restaurant: 'bg-blue',
            membership: 'bg-blue',
            membershipmanager: 'bg-blue',
        };
        return colors[roleLower] || 'bg-gray-400';
    };

    const avatarColor = staff.profileImage
        ? 'bg-gray-200'
        : getAvatarColor(staff.role);

    return (
        <div className="h-screen bg-[#FFF9F0] flex flex-col overflow-hidden p-4 relative">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="absolute top-10 left-10 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
                <MdChevronLeft className="h-6 w-6" />
                <span className="text-sm font-medium">Back</span>
            </button>

            <div className="max-w-sm mx-auto w-full flex flex-col flex-1 justify-center space-y-8 py-8">
                {/* Staff Profile Section - Left aligned */}
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-blue-400">
                        {staff.profileImage ? (
                            <AvatarImage
                                src={staff.profileImage}
                                alt={staff.name}
                                className="object-cover"
                            />
                        ) : (
                            <AvatarFallback
                                className={cn(
                                    'text-white text-lg font-semibold',
                                    avatarColor,
                                )}
                            >
                                {getInitialsFromName()}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {staff.name}
                        </h2>
                        <p className="text-sm text-gray-500 capitalize mt-0.5">
                            {staff.role}
                        </p>
                    </div>
                </div>

                {/* PIN Entry Card */}
                <Card className="p-3 space-y-2.5">
                    <h3 className="text-center text-[10px] font-medium text-gray-700">
                        Enter your 4 digit Pin to login
                    </h3>

                    {/* PIN Indicators */}
                    <div className="flex justify-center gap-1.5">
                        {pin.map((digit, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors',
                                    digit
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'bg-white border-orange-500',
                                )}
                            >
                                {digit && (
                                    <span className="text-white font-semibold text-xs">
                                        •
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() =>
                                    handleNumberClick(num.toString())
                                }
                                disabled={isLoading}
                                className="aspect-square rounded-lg h-[58px] w-[104px] border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleBackspace}
                            disabled={isLoading}
                            className="aspect-square rounded-lg h-[58px] w-[104px] border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="h-4 w-4 text-gray-700" />
                        </button>
                        <button
                            onClick={() => handleNumberClick('0')}
                            disabled={isLoading}
                            className="aspect-square rounded-lg h-[58px] w-[104px] border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            0
                        </button>
                        {/* Empty space on bottom right */}
                        <div className="aspect-square"></div>
                    </div>
                </Card>

                {/* Login Button */}
                <Button
                    onClick={handleLogin}
                    size="lg"
                    disabled={pin.join('').length !== 4 || isLoading}
                    className="w-full bg-orion-blue hover:bg-[#0059ff] text-white py-2 h-12 text-sm font-semibold flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-300" />
                            <span>Logging in...</span>
                        </>
                    ) : (
                        <span>Login</span>
                    )}
                </Button>
            </div>
        </div>
    );
}
