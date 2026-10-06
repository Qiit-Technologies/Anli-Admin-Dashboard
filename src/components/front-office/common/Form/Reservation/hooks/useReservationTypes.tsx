import React, { useEffect, useState } from 'react';
import { FormValues } from '../types';

type ReservationType = 'REGULAR' | 'COMPLIMENTARY' | 'DISCOUNT' | 'VOID';

interface UseReservationTypeProps {
    mode: 'add' | 'update';
    setFormData: React.Dispatch<React.SetStateAction<Partial<FormValues>>>;
    /** When true, do not overwrite form flags (draft invoice conversion). */
    preserveFormFlags?: boolean;
}

export const useReservationType = ({
    mode,
    setFormData,
    preserveFormFlags = false,
}: UseReservationTypeProps) => {
    const [reservationType, setReservationType] = useState<ReservationType>();
    const [formFlags, setFormFlags] = useState<Partial<any>>({});

    useEffect(() => {
        if (mode === 'update' || preserveFormFlags) {
            return;
        }

        if (reservationType) {
            switch (reservationType) {
                case 'COMPLIMENTARY':
                    setFormData((prev) => ({ ...prev, isComplimentary: true }));
                    break;
                case 'VOID':
                    setFormData((prev) => ({
                        ...prev,
                        isVoid: true,
                        isWalkIn: false,
                    }));
                    break;
                case 'DISCOUNT':
                    setFormData((prev) => ({
                        ...prev,
                        discountType: 'PERCENTAGE',
                        discountValue: 0,
                    }));
                    break;
                case 'REGULAR':
                default:
                    setFormData((prev) => ({
                        ...prev,
                        isComplimentary: false,
                        isVoid: false,
                        discountType: undefined,
                        discountValue: undefined,
                        discountReason: '',
                        voidReason: '',
                    }));
                    break;
            }
        }
    }, [reservationType, mode, setFormData, preserveFormFlags]);

    return {
        reservationType,
        setReservationType,
        formFlags,
        setFormFlags,
    };
};
