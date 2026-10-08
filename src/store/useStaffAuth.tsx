import { getStaff } from '@/app/actions/staff';
import api from '@/lib/axios';
import { getAuthToken } from '@/app/actions/auth/auth-token';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type Staff = {
    id: number;
    fullName: string;
    email: string;
    roles: {
        name: string;
        id: number;
    };
};

type User = {
    email?: string;
    roles?: {
        name: string;
    };
};

interface StaffAuthState {
    authorizedStaff: Staff | null;
    isLoading: boolean;
    error: Error | null;
    fetchAuthorizedStaff: (
        currentUser: User | undefined | null,
    ) => Promise<void>;
    setAuthorizedStaff: (staff: Staff | null) => void;
    clearAuthorizedStaff: () => void;
}

const useStaffAuth = create<StaffAuthState>()(
    devtools(
        (set, get) => ({
            authorizedStaff: null,
            isLoading: false,
            error: null,

            fetchAuthorizedStaff: async (currentUser) => {
                if (!currentUser || !localStorage.getItem('authToken')) {
                    // Reset if the session is gone
                    if (get().authorizedStaff) set({ authorizedStaff: null });
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    // Extract fields from current user (acting as staff member)
                    const rawId = (currentUser as any).id;
                    console.log(rawId);
                    const rawFullName = (currentUser as any).fullName;
                    const rawRoles = (currentUser as any).roles;

                    const staffData: Staff = {
                        id: typeof rawId === 'number' ? rawId : 0,
                        fullName: rawFullName || 'Staff Member',
                        email: currentUser.email || '',
                        roles: {
                            name: rawRoles?.name || 'Staff',
                            id:
                                typeof rawRoles?.id === 'number'
                                    ? rawRoles.id
                                    : 0,
                        },
                    };

                    console.log(
                        '[StaffAuth] Init staff state:',
                        staffData.fullName,
                        `(ID: ${staffData.id})`,
                    );

                    set({ authorizedStaff: staffData, isLoading: false });
                } catch (error: any) {
                    console.error('[StaffAuth] Initialization failed:', error);
                    set({ error: error as Error, isLoading: false });
                }
            },

            setAuthorizedStaff: (staff) => set({ authorizedStaff: staff }),
            clearAuthorizedStaff: () => set({ authorizedStaff: null }),
        }),
        { name: 'StaffAuth', enabled: true },
    ),
);

export default useStaffAuth;
