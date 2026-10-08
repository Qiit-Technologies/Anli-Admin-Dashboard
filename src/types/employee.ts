import { Module } from '@/app/actions/modules';
import { Permission } from '@/app/actions/permissions';

type Role = {
    id: number;
    name: string;
    description: string;
    imageUrl: string | null;
    department: string | null;
    createdAt: string;
};

export type EmployeeType = {
    id: number;
    username: string;
    fullName: string;
    password: string;
    email: string;
    profileImage: string | null;
    status: 'online' | 'offline';
    lastLoginAt: string | null;
    lastLogoutAt: string | null;
    createdAt: string;
    deletedAt: string | null;
    type: string | null;
    homeAddress: string | null;
    phoneNumber: string | null;
    code: string | null;
    startDate: string | null;
    workMode: 'Monthly' | 'Weekly' | 'Daily';
    branch: string | null;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    bankCode: string | null;
    salary: string;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    relationship: string | null;
    imageUrl: string | null;
    employmentLetter: string | null;
    isActive: boolean;
    roles: Role;
    modules?: Module[];
    permissions?: Permission[];
};
