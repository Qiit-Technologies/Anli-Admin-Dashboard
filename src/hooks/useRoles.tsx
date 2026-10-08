import { fetchRoles } from '@/app/actions/staff';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Permission } from '@/app/actions/permissions';

type RoleResponse = {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    permissions: Permission[];
};

const ROLES_KEY = 'roles-list';

const useRoles = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading, mutate } = useSWR(
        ROLES_KEY,
        async () => {
            const { data } = await fetchRoles();
            const simplifiedRoles: RoleResponse[] = data.map((role: any) => ({
                id: role.id,
                name: role.name,
                description: role.description ?? '----',
                createdAt: role.createdAt ?? 'No date',
                permissions: role.permissions || [],
            }));
            return simplifiedRoles;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        },
    );

    const roles = useMemo(() => {
        if (!data) return [];
        return data.filter(
            (role: RoleResponse) =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                role.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        );
    }, [data, searchQuery]);

    const refreshRoles = () => {
        mutate();
    };

    return {
        roles,
        searchQuery,
        setSearchQuery,
        isLoading,
        refreshRoles,
    };
};

export default useRoles;
