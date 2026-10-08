'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlobalMenuSearchSlot } from '@/components/layout/HospitalityModuleChrome';
import NotificationsPopup from '@/components/NotificationDropdown';
import { useUser } from '@/context/useUser';
import { isMenuSearchModulePath } from '@/lib/global-menu-search/modules';
import { cn } from '@/lib/utils';
import { ArrowLeft, Search, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

interface PageHeaderProps {
    children?: React.ReactNode;
}

interface PageHeaderTitleProps {
    title: string;
    subtitle?: string;
    hasBack?: boolean;
    onBack?: () => void;
    extentContent?: React.ReactNode;
}

export const PageHeader = ({
    children,
    className,
    showMenuSearch,
}: {
    children: React.ReactNode;
    className?: string;
    showMenuSearch?: boolean;
}) => {
    const pathname = usePathname();
    const shouldShowMenuSearch =
        showMenuSearch ?? isMenuSearchModulePath(pathname);

    return (
        <header
            className={cn(
                'w-full bg-white border-b border-gray-100 px-4 lg:px-8 pt-8 pb-5 sticky top-0 z-40 flex md:flex-row flex-col md:items-center justify-between gap-4 shadow-none transition-shadow',
                className,
            )}
        >
            {shouldShowMenuSearch ? (
                <>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                        {children}
                    </div>
                    <GlobalMenuSearchSlot />
                </>
            ) : (
                children
            )}
        </header>
    );
};

export const PageHeadertitle = ({
    title,
    subtitle,
    hasBack,
    onBack,
    extentContent,
}: PageHeaderTitleProps) => {
    const router = useRouter();
    return (
        <div
            className={cn(
                'flex items-center gap-4',
                extentContent && 'flex-col gap-4 items-start',
            )}
        >
            {extentContent && extentContent}
            {hasBack && (
                <Button
                    onClick={onBack || (() => router.back())}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 bg-white rounded-full border border-gray-100 text-gray-400 hover:text-foreground"
                >
                    <ArrowLeft size={16} />
                </Button>
            )}
            <div className="flex flex-col">
                <h1 className="font-semibold text-lg text-foreground tracking-tight leading-none">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
};

export const HeaderActions = ({ children }: { children?: React.ReactNode }) => {
    const { user } = useUser();
    return (
        <div className="flex items-center gap-3">
            {children}
            <div className="relative w-72 mr-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search"
                    className="pl-10 h-10 border-gray-100 bg-gray-50/50 rounded-lg text-sm focus:bg-white transition-all"
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:bg-gray-50 rounded-full"
            >
                <Settings className="h-5 w-5" />
            </Button>
            <NotificationsPopup />
            <div className="flex items-center gap-2 border border-[#D0D5DD] rounded-full pl-1 pr-3 py-1 bg-white cursor-pointer">
                <Avatar className="w-8 h-8">
                    <AvatarImage
                        src={user?.profileImage || '/avatar-placeholder.png'}
                    />
                    <AvatarFallback className="bg-[#FEF0C7] text-[#DC6803] font-medium text-xs">
                        {user?.fullName
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'GU'}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#101828]">
                    {user?.fullName || 'Guest'}
                </span>
            </div>
        </div>
    );
};
