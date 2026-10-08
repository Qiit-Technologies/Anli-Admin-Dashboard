'use client';

import { OrganizationDetail } from '@/hooks/useHotel';
import { cn } from '@/lib/utils';
import { TUser } from '@/types/user';
import { Grid3X3, List, Loader2, Shield } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import NotificationsPopup from '../NotificationDropdown';
import UserDropdown from '../UserDropdown';
import { Button } from '../ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';
import { Separator } from '../ui/separator';
import PageWrapper from './PageWrapper';
import { PageHeader } from './layout/Header';

interface ModuleCardData {
    title: string;
    service: string;
    description: string;
    icon: React.ElementType;
    href: string;
}

interface DashboardOverviewProps {
    modules: ModuleCardData[];
    role?: string;
    loading?: boolean;
    hotel: OrganizationDetail | null;
    user: TUser | undefined;
}

export default function DashboardOverview({
    modules,
    role = 'Administrator',
    hotel,
    user,
    loading,
}: DashboardOverviewProps) {
    const [viewType, setViewType] = useState<'cards' | 'list'>('cards');

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full">
                <Loader2 className="w-10 h-10 animate-spin text-brand" />
                Loading. Please wait...
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <h1>Welcome, {user?.fullName}</h1>
                <div className="ml-auto flex items-center gap-3">
                    <NotificationsPopup />
                    <UserDropdown role={role} />
                </div>
            </PageHeader>

            <div className="w-full flex px-4">
                <div className="flex flex-col gap-8 w-full">
                    <div className="flex text-center flex-col items-center gap-1 text-muted-foreground">
                        <div className="w-[100px] h-[100px] relative">
                            <Image
                                src={
                                    user?.profileImage ??
                                    'https://placehold.co/400x400.png'
                                }
                                alt="User avatar"
                                fill
                                className="rounded-full object-scale-down"
                            />
                        </div>
                        <h1 className="text-lg font-bold">
                            Welcome Onboard{' '}
                            {role === 'Manager' ? user?.fullName : hotel?.name}
                        </h1>
                        <p className="text-gray-400">
                            Please navigate to any of the modules to get
                            started.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={
                                        viewType === 'cards'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setViewType('cards')}
                                    className={cn(
                                        'flex items-center gap-2 hover:bg-orion-blue hover:text-white',
                                        viewType === 'cards' && 'bg-orion-blue',
                                    )}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                    Cards
                                </Button>
                                <Button
                                    variant={
                                        viewType === 'list'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setViewType('list')}
                                    className={cn(
                                        'flex items-center gap-2 hover:bg-orion-blue hover:text-white',
                                        viewType === 'list' && 'bg-orion-blue',
                                    )}
                                >
                                    <List className="h-4 w-4" />
                                    List
                                </Button>
                            </div>
                        </div>

                        {viewType === 'cards' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {modules.map((module) => (
                                    <Link href={module.href} key={module.title}>
                                        <div className="w-full bg-white hover:border-brand h-full border flex items-center flex-col gap-3 p-4 py-6 rounded-xl transition-colors">
                                            <div>
                                                {module.icon && (
                                                    <module.icon className="h-10 w-10 text-hexbrand" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <h1 className="text-lg font-bold">
                                                    {module.title}
                                                </h1>
                                                <p className="text-muted-foreground text-sm text-center">
                                                    {module.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {viewType === 'list' && (
                            <div className="bg-white rounded-lg border">
                                {modules.map((module, index) => (
                                    <div key={module.title}>
                                        <Link href={module.href}>
                                            <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex-shrink-0">
                                                    {module.icon && (
                                                        <module.icon className="h-8 w-8 text-hexbrand" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg">
                                                        {module.title}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        {module.description}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        Access →
                                                    </Button>
                                                </div>
                                            </div>
                                        </Link>
                                        {index < modules.length - 1 && (
                                            <Separator />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {role === 'Manager' && (
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Your Permissions
                                </CardTitle>
                                <CardDescription>
                                    Overview of your current access permissions
                                    and capabilities
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="shadow-none">
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">
                                            {role} Access
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-700 mt-1">
                                        You have {user?.permissions.length ?? 0}{' '}
                                        permission
                                        {user?.permissions.length === 1
                                            ? ''
                                            : 's'}
                                        .
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
