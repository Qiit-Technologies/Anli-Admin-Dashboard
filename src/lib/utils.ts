import { signout } from '@/app/actions/auth';
import { BankAccount } from '@/app/actions/bank-accounts';
import { updateStaffLogoutTime } from '@/app/actions/staff';
import { clsx, type ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'NGN 0';

    // Ensure numericAmount is actually a number and not a string
    const safeAmount = isNaN(numericAmount) ? 0 : numericAmount;

    return `₦${safeAmount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-NG', {
        maximumFractionDigits: 2,
        notation: value > 1000000 ? 'compact' : 'standard',
    }).format(value);
}

export function extractDateTime(isoString: string) {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}`;
    return {
        date: formattedDate,
        time: formattedTime,
        ampm: ampm,
        fullDateTime: `${formattedDate} ${formattedTime} ${ampm}`,
    };
}
export function convertColorToOpacity(color: string, opacity: number): string {
    if (color.startsWith('rgba') || color.startsWith('hsla')) {
        return color.replace(/,[^,]+\)$/, `, ${opacity})`);
    }

    if (color.startsWith('#')) {
        color = color.substring(1);

        if (color.length === 3) {
            color = color
                .split('')
                .map((char) => char + char)
                .join('');
        }

        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    return color;
}

export function extractDateFromISO(isoString: string) {
    const date = new Date(isoString);
    return format(date, 'PPP');
}

export function extractTimeFromISO(isoString: string) {
    const date = new Date(isoString);
    return format(date, 'p');
}

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

export const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

export const handleLogout = async (userId: number) => {
    try {
        if (userId) {
            await updateStaffLogoutTime(userId);
        }

        // Preserve hotelId for staff login page (store in a separate key)
        const hotelId = localStorage.getItem('hotelId');
        if (hotelId) {
            localStorage.setItem('staffLoginHotelId', hotelId);
        }

        await signout();
        localStorage.removeItem('user');
        localStorage.removeItem('hotelId');

        return { success: true };
    } catch (error: any) {
        console.error('Logout error:', error);
        return { success: false, error };
    }
};

export function getDynamicFilters(data: any[] = [], path: string) {
    if (!data || data.length === 0) return [];

    const keys = path.split('.');

    const uniqueValues = [
        ...new Set(
            data
                .map((item) => {
                    let value = item;
                    for (const key of keys) {
                        if (
                            value &&
                            typeof value === 'object' &&
                            key in value
                        ) {
                            value = value[key];
                        } else {
                            return undefined;
                        }
                    }
                    return value;
                })
                .filter(
                    (value): value is string | number => value !== undefined,
                ),
        ),
    ];

    return uniqueValues.map((value) => ({
        value: String(value),
        label: String(value),
    }));
}

export const formatBankAccountLabel = (account: BankAccount) => {
    let label = account.accountName;

    label += ` (${account.bankName})`;

    label += ` - ${account.accountNumber}`;

    return label;
};

export function getInitials(fullName: string): string {
    if (!fullName) return '';

    const names = fullName.trim().split(' ');
    const initials = names
        .filter((n) => n.length > 0)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');

    return initials;
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'bg-orange-100 text-orange-800';
        case 'approved':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getFileType = (fileName?: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const ext = fileName?.split('.')?.pop()?.toLowerCase();

    if (!ext) return 'document';

    if (imageExtensions.includes(ext)) {
        return 'image';
    } else {
        return 'document';
    }
};
