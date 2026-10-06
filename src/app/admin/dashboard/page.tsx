'use client';
import DashboardOverview from '@/components/common/AdminDashboard';
import DashboardLoader from '@/components/DashboardLoader';
import { serviceModules } from '@/components/services';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import { useMemo } from 'react';

const AdminDashboard = () => {
    const { user } = useUser();
    const { organization: hotelDetails, loading } = useHotel();

    const services = useMemo(() => {
        if (!hotelDetails?.services) return [];

        const baseServices = hotelDetails.services
            .split(',')
            .map((s) => s.trim());

        return baseServices.includes('restaurant')
            ? Array.from(new Set([...baseServices, 'kitchen', 'back_of_house']))
            : baseServices;
    }, [hotelDetails?.services]);

    const accessibleModules = serviceModules.filter((mod) =>
        services.includes(mod.service),
    );

    if (loading) {
        return <DashboardLoader />;
    }

    return (
        <DashboardOverview
            user={user}
            hotel={hotelDetails}
            loading={loading}
            modules={accessibleModules}
            role="Administrator"
        />
    );
};

export default AdminDashboard;
