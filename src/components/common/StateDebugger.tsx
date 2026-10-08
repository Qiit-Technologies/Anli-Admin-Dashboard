'use client';

import { useEffect } from 'react';
import useStaffAuth from '@/store/useStaffAuth';
import useOrderStore from '@/store/useOrder';
import useBookingStore from '@/store/useBookingStore';
import useStayViewStore from '@/store/useSV';
import { useUser } from '@/context/useUser';

export function StateDebugger() {
    const { user } = useUser();
    const { authorizedStaff, fetchAuthorizedStaff } = useStaffAuth();

    // Debugging logic
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Expose Zustand stores
            (window as any).useStaffAuth = useStaffAuth;
            (window as any).useOrderStore = useOrderStore;
            (window as any).useBookingStore = useBookingStore;
            (window as any).useStayViewStore = useStayViewStore;

            // Expose User Context snapshot
            (window as any).getUserContext = () => ({ user, authorizedStaff });

            console.log(
                '%c[ANLI Debugger]%c Stores attached to window. Try typing %cuseStaffAuth.getState()%c in the console.',
                'color: #FF6F00; font-weight: bold;',
                'color: inherit;',
                'color: #0070F3; font-weight: bold;',
                'color: inherit;',
            );
        }
    }, [user, authorizedStaff]);

    // Initializer logic
    useEffect(() => {
        if (user && !authorizedStaff) {
            fetchAuthorizedStaff(user);
        }
    }, [user, authorizedStaff, fetchAuthorizedStaff]);

    return null;
}
