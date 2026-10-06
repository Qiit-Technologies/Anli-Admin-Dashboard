import { fetchHotelById } from '@/app/actions/hotel';
import { Staff } from '@/types/staff.types';
import useSWR from 'swr';

export interface OrganizationDetail {
    id: number;
    name: string;
    isActive: boolean;
    address: string;
    businessType: 'HOTEL' | string;
    registrationNumber: string;
    country: string;
    state: string;
    createdAt: string | Date;
    taxId: string | null;
    incorporationCert: string | null;
    boardingToken: string | null;
    services: string;
    isEmailVerified: boolean;
    isCacVerified: boolean;
    coverImage: string | null;
    /** Branding-friendly contact fields used on confirmations and receipts. */
    printoutName?: string | null;
    printoutAddress?: string | null;
    printoutEmail?: string | null;
    /** Free-form string. Multiple numbers may be separated by comma / slash / semicolon. */
    printoutPhone?: string | null;
    /** Per-hotel HTML override for the reservation confirmation Terms & Conditions block. */
    reservationTermsHtml?: string | null;
    owner: {
        fullName: string;
        email: string;
        orgName: string;
        phoneNumber: string;
        profileImage: string;
    };
    disbursementType: string;
    vatRate?: number;
    serviceChargeRate?: number;
    tipRate?: number;
    enableTip?: boolean;
    frontOfficeVatRate?: number;
    frontOfficeServiceChargeRate?: number;
    frontOfficeTipRate?: number;
    restaurantVatRate?: number;
    restaurantServiceChargeRate?: number;
    restaurantTipRate?: number;
    restaurantVatInclusive?: boolean;
    frontOfficeVatInclusive?: boolean;
    restaurantServiceChargeInclusive?: boolean;
    frontOfficeServiceChargeInclusive?: boolean;
    restaurantTipInclusive?: boolean;
    frontOfficeTipInclusive?: boolean;
    restaurantCustomChargesInclusive?: boolean;
    frontOfficeCustomChargesInclusive?: boolean;
    complimentarySettings: {
        id: number;
        enabled: boolean;
        maxAmountPerOrder: string;
        appliesTo: string[];
        allowedApprovers: Staff[];
    };
}

const useHotel = () => {
    const { data, error, isLoading } = useSWR<OrganizationDetail>(
        'hotel-details',
        async () => {
            const response = await fetchHotelById();
            return response.data;
        },
    );

    return {
        organization: data ?? null,
        loading: isLoading,
        error: error ?? null,
    };
};

export default useHotel;
