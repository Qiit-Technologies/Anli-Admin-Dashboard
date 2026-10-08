import { Member } from '@/types/membership/membership';

export function formatMemberFullName(
    member?: Pick<Member, 'firstName' | 'lastName'> | null,
) {
    if (!member) return 'Unknown member';
    return `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim() || 'Unknown member';
}

/** Lowercase string used for member search; skips null/undefined fields. */
export function memberSearchHaystack(member: Member) {
    return [
        member.firstName,
        member.lastName,
        member.email,
        member.phone,
        member.membershipId,
        member.id,
    ]
        .filter((value): value is string => Boolean(value))
        .join(' ')
        .toLowerCase();
}

export function memberMatchesQuery(member: Member, query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return false;
    return memberSearchHaystack(member).includes(normalized);
}

/** True when member is a referral (linked to a principal). */
export function isReferralMember(
    member?: Pick<Member, 'referredBy' | 'planOwner'> | null,
) {
    if (!member) return false;
    return Boolean(member.referredBy || member.planOwner);
}

export function formatReferralCode(memberId: string) {
    return `REF-${memberId.slice(0, 8)}`;
}

export function getMemberQrPrintLabel(member: Member) {
    return isReferralMember(member)
        ? 'Referral member (no discount)'
        : 'Principal member';
}

export const MIN_MEMBER_AGE_YEARS = 18;

/** Latest allowed birth date for a member who meets the minimum age. */
export function getMaximumBirthDateForMinAge(
    minAgeYears = MIN_MEMBER_AGE_YEARS,
): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - minAgeYears);
    return date.toISOString().split('T')[0];
}

export function validateMemberDateOfBirth(
    dateOfBirth: string | undefined | null,
    minAgeYears = MIN_MEMBER_AGE_YEARS,
): { valid: boolean; message?: string } {
    if (!dateOfBirth?.trim()) {
        return { valid: true };
    }

    const birthDate = new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
        return { valid: false, message: 'Please enter a valid date of birth.' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);

    if (birthDate >= today) {
        return {
            valid: false,
            message: 'Date of birth must be in the past.',
        };
    }

    const minimumBirthDate = new Date(today);
    minimumBirthDate.setFullYear(today.getFullYear() - minAgeYears);

    if (birthDate > minimumBirthDate) {
        return {
            valid: false,
            message: `Member must be at least ${minAgeYears} years old.`,
        };
    }

    return { valid: true };
}

export function getDaysUntilMembershipExpiry(
    endDate: string | Date | undefined | null,
): number | null {
    if (!endDate) return null;

    const expiry = new Date(endDate);
    if (Number.isNaN(expiry.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    return Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
}

export function isMembershipExpiringSoon(
    endDate: string | Date | undefined | null,
    withinDays = 30,
): boolean {
    const daysUntilExpiry = getDaysUntilMembershipExpiry(endDate);
    return (
        daysUntilExpiry !== null &&
        daysUntilExpiry >= 0 &&
        daysUntilExpiry <= withinDays
    );
}
