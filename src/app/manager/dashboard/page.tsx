'use client';
import DashboardOverview from '@/components/common/AdminDashboard';
import { useUser } from '@/context/useUser';
import { useUserRouting } from '@/hooks/auth/useUserRouting';
import useHotel from '@/hooks/useHotel';

export default function ManagerDashboardPage() {
    const { user } = useUser();
    const { organization: hotelDetails, loading } = useHotel();
    const { getUserAccessibleModules } = useUserRouting();

    const accessibleModules = getUserAccessibleModules();

    return (
        <DashboardOverview
            hotel={hotelDetails}
            user={user}
            loading={loading}
            modules={accessibleModules}
            role="Manager"
        />
    );
}
