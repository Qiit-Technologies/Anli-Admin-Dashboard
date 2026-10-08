'use client';

import { StaffProfileCard } from '@/components/staff/StaffProfileCard';
import { StaffPinEntry } from '@/components/staff/StaffPinEntry';
import CustomLoader from '@/components/Loader';
import Toast from '@/components/toast';
import {
    staffLogin,
    getCurrentlyLoggedInStaff,
    getScheduledStaffForToday,
} from '@/app/actions/staff-login';
import {
    getDefaultPathForRole,
    getDefaultPathForModules,
    getRealModuleRoutes,
    hasMultipleRolePaths,
    UserRole,
} from '@/lib/role-paths';
import { useUserProfile } from '@/hooks/useUser';
import { useUser } from '@/context/useUser';
import { useSWRConfig } from 'swr';
import { TUser } from '@/types/user';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Staff } from '@/types/staff.types';

interface StaffMember {
    id: number;
    name: string;
    role: string;
    profileImage?: string;
    isLoggedIn?: boolean;
    lastLoginAt?: string | Date | null;
    status?: string;
}

export default function StaffLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useUser();
    const { mutate } = useSWRConfig();
    const { refreshProfile } = useUserProfile();
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [currentlyLoggedIn, setCurrentlyLoggedIn] = useState<StaffMember[]>(
        [],
    );
    const [scheduledStaff, setScheduledStaff] = useState<StaffMember[]>([]);
    const [showAllStaff, setShowAllStaff] = useState(false);

    // Get hotelId from URL params or localStorage
    const hotelId = useMemo(() => {
        // First, try to get from URL query parameter
        const hotelIdFromUrl = searchParams.get('hotelId');
        if (hotelIdFromUrl) {
            return hotelIdFromUrl;
        }

        // Fallback to localStorage (current session)
        if (typeof window !== 'undefined') {
            const hotelIdFromStorage = localStorage.getItem('hotelId');
            if (hotelIdFromStorage) {
                return hotelIdFromStorage;
            }

            // If not in current session, check for preserved hotelId from previous login
            const preservedHotelId = localStorage.getItem('staffLoginHotelId');
            if (preservedHotelId) {
                return preservedHotelId;
            }
        }

        return undefined;
    }, [searchParams]);

    // Fetch staff list on component mount
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                setLoadingStaff(true);

                // Check if hotelId is available
                if (!hotelId) {
                    console.warn(
                        'No hotelId provided. Staff list cannot be fetched.',
                    );
                    setCurrentlyLoggedIn([]);
                    setScheduledStaff([]);
                    return;
                }

                // Fetch currently logged in staff
                const loggedInResponse =
                    await getCurrentlyLoggedInStaff(hotelId);

                // Fetch scheduled staff for today
                const scheduledResponse =
                    await getScheduledStaffForToday(hotelId);

                // Transform logged-in staff data
                if ('error' in loggedInResponse) {
                    console.error(
                        'Error fetching logged-in staff:',
                        loggedInResponse.error,
                    );
                    setCurrentlyLoggedIn([]);
                } else {
                    const loggedInStaff: StaffMember[] =
                        loggedInResponse.data?.map(
                            (
                                staff: Staff & {
                                    profileImage?: string;
                                    lastLoginAt?: string | Date | null;
                                    status?: string;
                                },
                            ) => ({
                                id: staff.id,
                                name: staff.fullName,
                                role: staff.roles?.name || 'Staff',
                                profileImage: staff.profileImage || undefined,
                                isLoggedIn: true,
                                lastLoginAt: staff.lastLoginAt || null,
                                status: staff.status || 'offline',
                            }),
                        ) || [];
                    setCurrentlyLoggedIn(loggedInStaff);
                }

                // Transform scheduled staff data
                if ('error' in scheduledResponse) {
                    console.error(
                        'Error fetching scheduled staff:',
                        scheduledResponse.error,
                    );
                    setScheduledStaff([]);
                } else {
                    const scheduledStaffData: StaffMember[] =
                        scheduledResponse.data?.map(
                            (
                                staff: Staff & {
                                    profileImage?: string;
                                    lastLoginAt?: string | Date | null;
                                    status?: string;
                                },
                            ) => ({
                                id: staff.id,
                                name: staff.fullName,
                                role: staff.roles?.name || 'Staff',
                                profileImage: staff.profileImage || undefined,
                                isLoggedIn: false,
                                lastLoginAt: staff.lastLoginAt || null,
                                status: staff.status || 'offline',
                            }),
                        ) || [];
                    setScheduledStaff(scheduledStaffData);
                }
            } catch (error: any) {
                console.error('Error fetching staff:', error);
                setCurrentlyLoggedIn([]);
                setScheduledStaff([]);
            } finally {
                setLoadingStaff(false);
            }
        };

        fetchStaff();
    }, [hotelId]);

    const handleStaffSelect = (staff: StaffMember) => {
        // Show PIN entry page for selected staff
        setSelectedStaff(staff);
    };

    const handleBackToStaffList = () => {
        setSelectedStaff(null);
    };

    const isStaffSelected = (staffId: number): boolean => {
        return selectedStaff !== null && selectedStaff.id === staffId;
    };

    // Role-based priority for sorting (higher number = higher priority)
    const getRolePriority = (role: string): number => {
        const roleLower = role.toLowerCase();
        const priorityMap: Record<string, number> = {
            manager: 100,
            administrator: 90,
            supervisor: 80,
            cashier: 70,
            waiter: 60,
            waitress: 60,
            chef: 50,
            headchef: 50,
            kitchen: 40,
            frontoffice: 35,
            front_of_house: 35,
            housekeeping: 30,
            housekeeper: 30,
            barmanager: 25,
            bar: 25,
            stock: 20,
            account: 15,
        };
        return priorityMap[roleLower] || 10;
    };

    // Prioritize and combine staff lists
    const prioritizedStaff = useMemo(() => {
        // Create a map to deduplicate staff (by ID)
        const staffMap = new Map<number, StaffMember>();

        // Add logged-in staff first (they have highest priority)
        currentlyLoggedIn.forEach((staff) => {
            staffMap.set(staff.id, staff);
        });

        // Add scheduled staff (skip if already in map)
        scheduledStaff.forEach((staff) => {
            if (!staffMap.has(staff.id)) {
                staffMap.set(staff.id, staff);
            }
        });

        // Convert map to array and sort
        const allStaff = Array.from(staffMap.values());

        // Sort by priority:
        // 1. Currently logged-in (status === 'online' or isLoggedIn === true)
        // 2. Most recently logged-in (lastLoginAt, most recent first)
        // 3. Role-based priority
        // 4. Alphabetical by name
        return allStaff.sort((a, b) => {
            // Priority 1: Currently logged-in
            const aIsOnline = a.isLoggedIn || a.status === 'online';
            const bIsOnline = b.isLoggedIn || b.status === 'online';
            if (aIsOnline && !bIsOnline) return -1;
            if (!aIsOnline && bIsOnline) return 1;

            // Priority 2: Most recently logged-in
            if (a.lastLoginAt && b.lastLoginAt) {
                const aDate = new Date(a.lastLoginAt).getTime();
                const bDate = new Date(b.lastLoginAt).getTime();
                if (aDate !== bDate) return bDate - aDate; // Most recent first
            } else if (a.lastLoginAt && !b.lastLoginAt) return -1;
            else if (!a.lastLoginAt && b.lastLoginAt) return 1;

            // Priority 3: Role-based priority
            const aRolePriority = getRolePriority(a.role);
            const bRolePriority = getRolePriority(b.role);
            if (aRolePriority !== bRolePriority) {
                return bRolePriority - aRolePriority; // Higher priority first
            }

            // Priority 4: Alphabetical by name
            return a.name.localeCompare(b.name);
        });
    }, [currentlyLoggedIn, scheduledStaff]);

    // Determine visible staff count based on screen size
    // Tablet portrait: 6 (2x3), Laptop/Tablet landscape: 9 (3x3)
    // For the main grid, show 8-9 items
    const maxVisibleStaff = 9;
    const mainGridStaff = prioritizedStaff.slice(0, maxVisibleStaff);
    const remainingStaff = prioritizedStaff.slice(maxVisibleStaff);
    const hasMoreStaff = remainingStaff.length > 0;

    const handlePinSubmit = async (pin: string) => {
        if (!selectedStaff) return;

        setIsLoading(true);

        try {
            const response = await staffLogin(selectedStaff.id, pin);

            if (
                response?.message === 'Staff login successful!' &&
                response.data
            ) {
                // Store hotel ID if available
                if (
                    typeof window !== 'undefined' &&
                    response.data.staff.hotel?.id
                ) {
                    const hotelIdString =
                        response.data.staff.hotel.id.toString();
                    localStorage.setItem('hotelId', hotelIdString);
                    // Also preserve it for future staff logins
                    localStorage.setItem('staffLoginHotelId', hotelIdString);
                }

                // Store staff token if provided
                if (response.data.token) {
                    localStorage.setItem('authToken', response.data.token);
                }

                const staffProfile = response.data.staff as unknown as TUser;

                if (staffProfile) {
                    setUser(staffProfile);
                    localStorage.setItem('user', JSON.stringify(staffProfile));
                }

                // refresh related data
                mutate('hotel-details');

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));

                // Redirect based on role or modules
                const staff = staffProfile;
                const userRole = staff.roles.name;
                const staffModules = staff.modules || [];
                const realModuleRoutes = getRealModuleRoutes(staffModules);
                let redirectPath = '/manager';

                if (userRole === 'administrator') {
                    redirectPath = '/admin';
                } else if (userRole === 'manager') {
                    redirectPath = '/manager';
                } else if (hasMultipleRolePaths(userRole)) {
                    redirectPath = '/manager';
                } else if (realModuleRoutes.length === 1) {
                    redirectPath = realModuleRoutes[0];
                } else if (realModuleRoutes.length > 1) {
                    redirectPath = '/manager';
                } else {
                    const rolePath = getDefaultPathForRole(
                        userRole as UserRole,
                    );
                    if (rolePath && rolePath !== '/manager') {
                        redirectPath = rolePath;
                    } else {
                        redirectPath = getDefaultPathForModules(staffModules);
                    }
                }

                router.push(redirectPath);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message || 'Login failed'}
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Staff login error:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="An unexpected error occurred. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingStaff) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <CustomLoader />
            </div>
        );
    }

    // Show message if hotelId is not provided
    if (!hotelId) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Login</span>
                    </Link>
                    <div className="flex flex-col items-center justify-center space-y-4 min-h-[60vh]">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Users className="h-8 w-8 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground">
                            Hotel ID Required
                        </h2>
                        <p className="text-muted-foreground text-center max-w-md">
                            Please provide a hotel ID to view staff members. You
                            can access this page with a hotel ID in the URL or
                            log in first to store it.
                        </p>
                        <Link
                            href="/signin"
                            className="mt-4 px-6 py-2 bg-orion-blue text-white rounded-md hover:bg-[#0059ff] transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Show PIN entry page if staff is selected
    if (selectedStaff) {
        return (
            <>
                {isLoading && <CustomLoader />}
                <StaffPinEntry
                    staff={{
                        id: selectedStaff.id,
                        name: selectedStaff.name,
                        role: selectedStaff.role,
                        profileImage: selectedStaff.profileImage,
                    }}
                    onPinSubmit={handlePinSubmit}
                    onBack={handleBackToStaffList}
                    isLoading={isLoading}
                />
            </>
        );
    }

    return (
        <>
            {isLoading && <CustomLoader />}
            <div className="min-h-screen bg-[#FFF9F0] p-6 md:p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Back to Login Link */}
                    <Link
                        href="/signin"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Login</span>
                    </Link>

                    {/* Header */}
                    <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                            Staff Login
                        </h1>
                    </div>

                    {/* Main Staff Grid - 2 columns for tablet portrait, 3 columns for laptop/landscape */}
                    {prioritizedStaff.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            No staff available
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {mainGridStaff.map((staff) => (
                                    <StaffProfileCard
                                        key={staff.id}
                                        name={staff.name}
                                        role={staff.role}
                                        profileImage={staff.profileImage}
                                        isLoggedIn={staff.isLoggedIn}
                                        onClick={() => handleStaffSelect(staff)}
                                        className={
                                            isStaffSelected(staff.id)
                                                ? 'ring-2 ring-orion-blue'
                                                : ''
                                        }
                                    />
                                ))}
                            </div>

                            {/* "+ More" Card - separate card below the grid */}
                            {hasMoreStaff && !showAllStaff && (
                                <button
                                    onClick={() => setShowAllStaff(true)}
                                    className="w-full rounded-xl border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 min-h-[120px] flex items-center justify-center transition-colors mt-4"
                                >
                                    <span className="text-xl font-bold text-foreground">
                                        + More
                                    </span>
                                </button>
                            )}

                            {/* Expanded Staff List - 3-column text layout */}
                            {showAllStaff && remainingStaff.length > 0 && (
                                <div className="mt-6 rounded-xl border border-gray-300 bg-white p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {remainingStaff.map((staff) => (
                                            <button
                                                key={staff.id}
                                                onClick={() =>
                                                    handleStaffSelect(staff)
                                                }
                                                className="text-left p-2 hover:bg-gray-50 rounded-md transition-colors"
                                            >
                                                <p className="font-bold text-foreground">
                                                    {staff.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground capitalize">
                                                    {staff.role}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
