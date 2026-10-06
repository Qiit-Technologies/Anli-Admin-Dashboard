export interface MembershipPlan {
    id: number;
    name: string;
    description?: string;
    price: number;
    duration: number;
    durationType: 'days' | 'months' | 'years';
    benefits: string[];
    maxMembers?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    referralTiers: ReferralTierDefinition[];
}

export interface ReferralTierDefinition {
    id: number;
    name: string;
    facilitiesAccessible: Facility[];
    createdAt: string;
    updatedAt: string;
}

enum MembershipTierEnum {
    PRINCIPAL = 'principal',
    GUEST = 'guest',
    FAMILY = 'family',
}
export type Member = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    occupation: string;
    workAddress: string;
    workEmail: string;
    dateOfBirth: string;
    startDate?: string | null;
    endDate?: string | null;
    phone: string;
    photoUrl?: string | null;
    identificationUrl?: string | null;
    createdAt: string;
    updatedAt: string;
    membershipId?: string;
    planId?: number;
    relationshipToPlanOwner?: string;
    plan?: MembershipPlan | null;
    membership: {
        id: number;
        hotelId: number;
    };
    referredMembers: Member[];
    referredBy?: string | null;
    planOwner?: Member;
    membershipTier: MembershipTierEnum;
    status: MemberStatusEnum;
    totalVisits: number;
    totalSpend: number;
    lastVisitDate?: string | null;
};

export type MemberStatus =
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'expired'
    | 'pending';

export enum MemberStatusEnum {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    EXPIRED = 'expired',
    PENDING = 'pending',
}

export interface OnboardMemberType {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    workAddress?: string;
    workEmail?: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    occupation: string;
    planId: number;
    startDate: string;
    endDate: string;
    photoUrl?: string;
    identificationUrl?: string;

    referredMembers?: Array<ReferredMember>;
    referralRecordsCount?: number;
}

export interface ReferredMember {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    workAddress?: string;
    workEmail?: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    occupation: string;
    planId: number;
    startDate: string;
    endDate: string;
    relationshipToPlanOwner: string;
    photoUrl?: string;
    identificationUrl?: string;
    membershipTier?: string;
    referralTierId?: number;
}

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
}

export interface Facility {
    id: number;
    name: string;
    description?: string;
    isBookable: boolean;
    category: string;
    image?: string;
    fee: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    orgName: string;
    email: string;
    fullName: string;
    password: string;
    phoneNumber: string;
    profileImage: string;
    is_verified: boolean;
    roleId: number;
    otp: string;
    otpExpiresAt: string;
    status: string;
    lastLoginAt: string;
    lastLogoutAt: string;
    deletedAt: string;
}

export interface MemberBooking {
    id: number;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    member: Member;
    facility: Facility;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingDto {
    memberId: string;
    facilityId: number;
    startTime: string;
    endTime: string;
    bookingMethod?: 'QR_CODE' | 'MANUAL_SEARCH';
}

export interface UpdateBookingDto {
    facilityId?: number;
    startTime?: string;
    endTime?: string;
    status?: BookingStatus;
}

export interface GuestServiceHistory {
    id: 1;
    facility: Facility;
    date: string;
    bookedBy: User;
}

export interface ServiceUsageSummary {
    service: Facility;
    lastUsed: string;
    totalVisits: number;
}

export interface VisitLog {
    id: number;
    date: string;
    time: string;
    checkInType: 'qr_code' | 'manual_search';
    facility: string;
    accessResult: 'granted' | 'denied';
    notes?: string | null;
    createdAt: string;
}

export interface Purchase {
    id: number;
    facility: Facility;
    description: string;
    amount: number;
    transactionId: string;
    date: string;
    createdAt: string;
}

export interface GuestHistoryQueryParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    facilityId?: number;
    checkInType?: string;
    accessResult?: string;
}

export type CheckInType = 'qr_code' | 'manual_search';

export type CheckInTypeEnum = {
    QR_CODE: 'qr_code';
    MANUAL_SEARCH: 'manual_search';
    CARD: 'card';
};
