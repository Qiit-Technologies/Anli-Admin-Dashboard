'use client';

import Toast from '@/components/toast';
import toast from 'react-hot-toast';
import ScanProgressToast from './ScanProgressToast';

const PROGRESS_TOAST_ID = 'qr-checkin-scan-progress';

function showCompactToast(
    type: 'success' | 'error' | 'info',
    title: string,
    description?: string,
) {
    toast.custom(
        (t) => (
            <Toast
                type={type}
                title={title}
                description={description ?? title}
                onClose={() => toast.dismiss(t.id)}
            />
        ),
        { duration: 2800, position: 'top-center' },
    );
}

function showProgressToast(title: string, description: string) {
    toast.custom(
        () => (
            <ScanProgressToast title={title} description={description} />
        ),
        {
            id: PROGRESS_TOAST_ID,
            duration: Infinity,
            position: 'top-center',
        },
    );
}

export const qrCheckInToast = {
    /** Camera live — prompt staff to hold the card still */
    showHoldSteady: () =>
        showProgressToast(
            'Scanning…',
            'Hold the membership card steady inside the frame',
        ),

    /** QR decoded — API lookup in progress */
    showValidating: () =>
        showProgressToast(
            'QR detected',
            'Looking up member — keep the card still for a moment',
        ),

    dismissProgress: () => toast.dismiss(PROGRESS_TOAST_ID),

    validated: (name: string) =>
        showCompactToast('success', 'Member verified', name),
    expiringSoon: (days: number) =>
        showCompactToast(
            'info',
            'Expiring soon',
            `Membership ends in ${days} day${days === 1 ? '' : 's'}`,
        ),
    invalid: (message: string) =>
        showCompactToast('error', 'Scan failed', message),
    statusBlocked: (status: string) =>
        showCompactToast('error', 'Cannot check in', `Account is ${status}`),
    checkedIn: (name: string) =>
        showCompactToast('success', 'Checked in', name),
    scannerError: (message: string) =>
        showCompactToast('error', 'Camera issue', message),
    missingFields: (message: string) =>
        showCompactToast('error', 'Check-in', message),
};
