/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    calculateNightsFromDates,
    calculateQuotationSubtotal,
    getRoomNightlyRate,
} from '@/lib/front-office/quotation-room-lines';
import React, { useMemo } from 'react';

interface UsePaymentCalculationsProps {
    formData: any;
    roomTypes: any[];
    roomType?: any;
    guestDetails?: any;
    vatRate?: number;
    serviceChargeRate?: number;
    tipRate?: number;
    customCharges?: Array<{
        id: number;
        name: string;
        rate: number;
        isActive?: boolean;
    }>;
    selectedRoom?: any;
}

export const usePaymentCalculations = ({
    formData,
    roomTypes,
    roomType,
    guestDetails,
    vatRate = 0,
    serviceChargeRate = 0,
    tipRate = 0,
    customCharges = [],
    selectedRoom,
}: UsePaymentCalculationsProps) => {
    // Normalize rates
    const normalizedVatRate = useMemo(() => {
        if (vatRate === null || vatRate === undefined) return 0;
        const numeric = Number(vatRate);
        if (Number.isNaN(numeric)) return 0;
        return Math.min(Math.max(numeric, 0), 100);
    }, [vatRate]);
    const normalizedServiceChargeRate = useMemo(() => {
        if (serviceChargeRate === null || serviceChargeRate === undefined)
            return 0;
        const numeric = Number(serviceChargeRate);
        if (Number.isNaN(numeric)) return 0;
        return Math.min(Math.max(numeric, 0), 100);
    }, [serviceChargeRate]);

    const normalizedTipRate = useMemo(() => {
        if (tipRate === null || tipRate === undefined) return 0;
        const numeric = Number(tipRate);
        if (Number.isNaN(numeric)) return 0;
        return Math.min(Math.max(numeric, 0), 100);
    }, [tipRate]);

    const includeVat = formData?.includeVat !== false;
    const includeTip = useMemo(() => {
        return formData?.includeTip === true;
    }, [formData?.includeTip]);
    const types = Array.isArray(roomTypes) ? roomTypes : [];
    const selectedAmount = useMemo(() => {
        const roomtypeValue = formData?.roomtype ?? roomType;
        return (
            types.find(
                (room) => Number(room.id) === Number(roomtypeValue),
            ) || null
        );
    }, [formData?.roomtype, roomType, types]);

    const discountCalculations = useMemo(() => {
        const primaryRoomTypeId = Number(formData?.roomtype ?? roomType ?? 0);
        const nightlyRate = getRoomNightlyRate(
            types,
            primaryRoomTypeId,
            selectedRoom,
        );
        const nights = calculateNightsFromDates(
            formData?.startDate,
            formData?.endDate,
        );
        const subtotal = calculateQuotationSubtotal(
            formData ?? {},
            types,
            nights,
            selectedRoom,
        );
        const discountType = formData?.discountType;
        const discountValue = Number(formData?.discountValue ?? 0);

        let discountAmount = 0;
        if (discountType === 'PERCENTAGE' && discountValue > 0) {
            discountAmount = (subtotal * discountValue) / 100;
        } else if (discountType === 'FIXED_AMOUNT' && discountValue > 0) {
            discountAmount = discountValue;
        }

        discountAmount = Math.min(discountAmount, subtotal);

        const finalPrice = Math.max(subtotal - discountAmount, 0);
        const vatAmount = includeVat
            ? Math.round((finalPrice * normalizedVatRate) / 100)
            : 0;
        const totalWithVat = finalPrice + vatAmount;
        const serviceChargeAmount = Math.round((finalPrice * normalizedServiceChargeRate) / 100);
        const totalWithServiceCharge = totalWithVat + serviceChargeAmount;
        const tipAmount = includeTip
            ? Math.round((finalPrice * normalizedTipRate) / 100)
            : 0;
        const totalWithTip = totalWithServiceCharge + tipAmount;

        // Calculate custom charges
        const customChargesData =
            customCharges
                ?.filter(
                    (charge) => charge.rate > 0 && charge.isActive !== false,
                )
                .map((charge) => {
                    const normalizedRate = Math.min(
                        Math.max(Number(charge.rate ?? 0), 0),
                        100,
                    );
                    const amount = Math.round(
                        (finalPrice * normalizedRate) / 100
                    );
                    return {
                        id: charge.id,
                        name: charge.name,
                        rate: normalizedRate,
                        amount,
                    };
                }) || [];

        const totalCustomChargesAmount = customChargesData
            .reduce((sum, charge) => sum + charge.amount, 0);

        const totalWithCustomCharges = totalWithTip + totalCustomChargesAmount;

        const paid = Number(
            formData?.amountPaid ?? guestDetails?.amountPaid ?? 0,
        );
        const remainingAmount = Math.max(totalWithCustomCharges - paid, 0);
        return {
            originalPrice: nightlyRate,
            discountAmount,
            finalPrice,
            remainingAmount,
            hasDiscount: discountType && discountValue > 0,
            nights,
            subtotal,
            vatAmount,
            vatRate: normalizedVatRate,
            totalWithVat,
            serviceChargeAmount,
            serviceChargeRate: normalizedServiceChargeRate,
            totalWithServiceCharge,
            tipAmount,
            tipRate: normalizedTipRate,
            totalWithTip,
            customCharges: customChargesData,
            totalCustomChargesAmount,
            totalWithCustomCharges,
        };
    }, [
        selectedAmount,
        formData?.discountType,
        formData?.discountValue,
        formData?.amountPaid,
        guestDetails?.amountPaid,
        formData?.startDate,
        formData?.endDate,
        formData?.quotationRooms,
        formData?.reservationLines,
        formData?.includeVat,
        types,
        normalizedVatRate,
        normalizedServiceChargeRate,
        normalizedTipRate,
        includeTip,
        includeVat,
        customCharges,
        selectedRoom,
    ]);

    const outstandingAmount = useMemo(() => {
        if (formData?.discountType && formData?.discountValue > 0) {
            return discountCalculations.remainingAmount;
        }

        const nights = calculateNightsFromDates(
            formData?.startDate,
            formData?.endDate,
        );
        const price = Number(
            calculateQuotationSubtotal(
                formData ?? {},
                types,
                nights,
                selectedRoom,
            ) || 0,
        );
        const vatPortion = includeVat
            ? Number(((price * normalizedVatRate) / 100).toFixed(2))
            : 0;
        const priceWithVat = Number((price + vatPortion).toFixed(2));
        const serviceChargePortion = Number(
            ((price * normalizedServiceChargeRate) / 100).toFixed(2),
        );
        const priceWithServiceCharge = Number(
            (priceWithVat + serviceChargePortion).toFixed(2),
        );
        const tipPortion = includeTip
            ? Number(((price * normalizedTipRate) / 100).toFixed(2))
            : 0;
        const priceWithTip = Number(
            (priceWithServiceCharge + tipPortion).toFixed(2),
        );

        // Calculate custom charges
        const customChargesPortion = Number(
            (
                customCharges
                    ?.filter((charge) => charge.rate > 0)
                    .reduce((sum, charge) => {
                        const normalizedRate = Math.min(
                            Math.max(Number(charge.rate ?? 0), 0),
                            100,
                        );
                        return sum + (price * normalizedRate) / 100;
                    }, 0) || 0
            ).toFixed(2),
        );

        const priceWithCustomCharges = Number(
            (priceWithTip + customChargesPortion).toFixed(2),
        );

        const paid = Number(
            formData?.amountPaid ?? guestDetails?.amountPaid ?? 0,
        );
        return Math.max(discountCalculations.totalWithCustomCharges - paid, 0);
    }, [
        discountCalculations.totalWithCustomCharges,
        formData?.amountPaid,
        guestDetails?.amountPaid,
        discountCalculations.remainingAmount,
        formData?.startDate,
        formData?.endDate,
        formData?.quotationRooms,
        formData?.reservationLines,
        formData?.includeVat,
        types,
        normalizedVatRate,
        normalizedServiceChargeRate,
        normalizedTipRate,
        includeTip,
        includeVat,
        customCharges,
        selectedRoom,
    ]);

    const updatePayment = (
        field: string,
        value: string,
        setFormData: React.Dispatch<React.SetStateAction<any>>,
    ) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    return {
        selectedAmount,
        outstandingAmount,
        discountCalculations,
        updatePayment,
    };
};
