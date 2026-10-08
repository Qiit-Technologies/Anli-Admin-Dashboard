'use client';
import { getStaff } from '@/app/actions/staff';
import { formatDate } from '@/lib/helpers';
import { SimplifiedStaff, Staff } from '@/types/staff.types';
import { useEffect, useState } from 'react';

const useStaff = (refreshTable: number) => {
    const [staff, setStaff] = useState<SimplifiedStaff[]>([]);
    const [lastPage, setLastPage] = useState(1);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            try {
                const response = await getStaff(page);
                const data = response?.data ?? [];
                const meta = response?.meta ?? { lastPage: 1 };
                const simplifiedStaff = data
                    .filter((staff: Staff) => staff.roles)
                    .map((staff: Staff) => ({
                        id: staff.id,
                        username: staff.username,
                        fullName: staff.fullName,
                        email: staff.email,
                        createdAt: formatDate(staff.createdAt),
                        department:
                            staff.roles?.department || staff.roles?.name,
                        departmentName: staff.roles?.name || 'Unknown',
                        roleId: staff.roles?.id || 0,
                        modules: staff.modules || [],
                        permissions: staff.permissions || [],
                    }))
                    .filter(
                        (staff) =>
                            staff.fullName
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                            staff.email
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()) ||
                            staff.department
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase()),
                    );

                setStaff(simplifiedStaff);
                setLastPage(meta.lastPage ?? 1);
            } catch (error: any) {
                console.error('Error fetching staff:', error);
                setStaff([]);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, [page, refreshTable, searchQuery]);

    return {
        staff,
        page,
        setPage,
        lastPage,
        searchQuery,
        setSearchQuery,
        isLoading: loading,
    };
};

export default useStaff;
