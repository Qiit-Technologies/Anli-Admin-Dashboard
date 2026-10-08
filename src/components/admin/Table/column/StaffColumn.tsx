'use client';
import { SimplifiedStaff } from '@/types/staff.types';
import { Tooltip } from '@heroui/react';
import { ColumnDef } from '@tanstack/react-table';
import ResetPasswordAction from '../ResetPasswordAction';

export const StaffMemberColumns: ColumnDef<SimplifiedStaff>[] = [
    {
        accessorKey: 'id',
        header: () => (
            <div>
                <Tooltip
                    className="text-muted-foreground rounded-sm font-medium"
                    content="Unique identifier for the staff member"
                    showArrow={true}
                >
                    <span className="flex items-center gap-2">ID</span>
                </Tooltip>
            </div>
        ),
        cell: ({ row }) => <span>#{row.original.id}</span>,
    },
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
        cell: ({ row }) => (
            <span className="font-medium">{row.original.fullName}</span>
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
        accessorKey: 'departmentName',
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
            <span className="capitalize">{row.original.departmentName}</span>
        ),
    },
    // {
    //     accessorKey: '',
    //     header: () => (
    //         <div>
    //             <Tooltip
    //                 className="text-muted-foreground rounded-sm font-medium"
    //                 content="Last login timestamp of the staff member"
    //                 showArrow={true}
    //             >
    //                 <span className="flex items-center gap-2">Last Login</span>
    //             </Tooltip>
    //         </div>
    //     ),
    //     cell: ({ row }) => (
    //         <span>
    //             {row.original.lastLogin
    //                 ? new Date(row.original.lastLogin).toLocaleString()
    //                 : 'Never'}
    //         </span>
    //     ),
    // },
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
        cell: ({ row }) => <ResetPasswordAction row={row} />,
    },
];
