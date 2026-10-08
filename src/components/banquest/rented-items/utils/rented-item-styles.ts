export const RENTED_CONDITION_STYLES: Record<
    string,
    { bg: string; text: string; label: string }
> = {
    excellent: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        label: 'Excellent',
    },
    good: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        label: 'Good',
    },
};

export const RENTED_STATUS_STYLES: Record<
    string,
    { bg: string; text: string; label: string }
> = {
    returned: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        label: 'Returned',
    },
    rented: {
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        label: 'Rented',
    },
    'over-due': {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        label: 'Over-due',
    },
};
