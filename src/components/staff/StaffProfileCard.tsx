'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface StaffProfileCardProps {
    name: string;
    role: string;
    profileImage?: string;
    isLoggedIn?: boolean;
    onClick?: () => void;
    className?: string;
}

export function StaffProfileCard({
    name,
    role,
    profileImage,
    isLoggedIn = false,
    onClick,
    className,
}: StaffProfileCardProps) {
    const initials = getInitials(name);

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

    const backgroundColor = profileImage ? 'bg-gray-200' : getAvatarColor(role);

    return (
        <Card
            className={cn(
                'rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 flex flex-col items-center gap-3 min-w-[140px]',
                isLoggedIn && 'ring-2 ring-orion-blue ring-offset-2',
                className,
            )}
            onClick={onClick}
        >
            <Avatar className="h-20 w-20">
                {profileImage ? (
                    <AvatarImage
                        src={profileImage}
                        alt={name}
                        className="object-cover"
                    />
                ) : (
                    <AvatarFallback
                        className={cn(
                            'text-white text-lg font-semibold',
                            backgroundColor,
                        )}
                    >
                        {initials}
                    </AvatarFallback>
                )}
            </Avatar>
            <div className="text-center space-y-1">
                <p className="font-semibold text-sm text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                    {role}
                </p>
            </div>
        </Card>
    );
}
