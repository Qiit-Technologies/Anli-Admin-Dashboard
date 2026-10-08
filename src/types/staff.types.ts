import { Module } from '@/app/actions/modules';
import { Permission } from '@/app/actions/permissions';
import { Meta } from '.';

export interface StaffResponse {
    data: Staff[];
    meta: Meta;
}

export interface Staff {
    id: number;
    username: string;
    fullName: string;
    email: string;
    createdAt: string;
    roles: {
        id: number;
        name: string;
        description: string;
        imageUrl: string;
        department: string;
    };
    modules: Module[];
    permissions: Permission[];
}

export interface SimplifiedStaff {
    id: number;
    username: string;
    fullName: string;
    email: string;
    createdAt: string;
    department: string;
    departmentName: string;
    roleId: number;
    modules: Module[];
    permissions: Permission[];
}

export interface MiniStaff {
    email: string;
    username: string;
    fullName: string;
    roleId: number;
}

export interface Role {
    id: number;
    department: string;
    name: string;
}

export type StaffColumn =
    | 'fullName'
    | 'department'
    | 'email'
    | 'createdAt'
    | 'actions';
