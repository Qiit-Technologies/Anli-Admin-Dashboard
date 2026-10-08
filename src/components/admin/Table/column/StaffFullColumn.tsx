'use client';
import { EmployeeType } from '@/types/employee';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/helpers';
import Image from 'next/image';
import StaffAction from '../StaffAction';

export const StaffMemberFullColumns: ColumnDef<EmployeeType>[] = [
    {
        accessorKey: 'fullName',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Full name of the staff member"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Name</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => {
            const getInitials = (name: string) => {
                const names = name.split(' ');
                return names
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
            };

            return (
                <div className="flex items-center gap-3">
                    {row.original.profileImage ? (
                        <Image
                            alt={row.original.fullName}
                            src={row.original.profileImage}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orion-blue text-xs font-medium text-white">
                            {getInitials(row.original.fullName)}
                        </div>
                    )}
                    <span>{row.original.fullName}</span>
                    {row.original.roles.name === 'administrator' && (
                        <Badge className="rounded-full bg-hexbrand/20 text-hexbrand shadow-none">
                            Admin
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'roles.name',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Full name of the staff member"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Role</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="font-medium">{row.original.roles.name}</span>
        ),
    },
    {
        accessorKey: 'email',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Email address of the staff member"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Email</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>{row.original.email}</span>,
    },
    {
        accessorKey: 'department',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Role or position of the staff member"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Deparment</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => (
            <span className="capitalize">
                {formatDate(row.original.createdAt)}
            </span>
        ),
    },
    {
        id: 'actions',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Available actions"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">Actions</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <StaffAction row={row} />,
    },
];
