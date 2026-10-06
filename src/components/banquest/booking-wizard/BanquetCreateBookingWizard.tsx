'use client';

import {
    createBanquetBooking,
    updateBanquetBooking,
} from '@/app/actions/banquet-booking';
import { calculateBanquetPricing } from '@/components/banquest/utils/banquet-pricing';
import { buildBanquetBookingPayload } from '@/components/banquest/utils/build-booking-payload';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { BookingForm, CreateBookingForm } from '../types';
import WizardShell from './WizardShell';
import AmenitiesStep from './steps/AmenitiesStep';
import CustomerStep from './steps/CustomerStep';
import EventStep from './steps/EventStep';
import MenuStep from './steps/MenuStep';
import PaymentStep from './steps/PaymentStep';
import ReviewStep from './steps/ReviewStep';
import { BanquetWizardState } from './types';
import {
    bookingFormToWizardState,
    wizardStateToBookingForm,
} from './wizard-to-booking-form';

const eventSchema = z
    .object({
        eventName: z.string().min(1, 'Event name is required'),
        eventType: z.string().min(1, 'Event type is required'),
        eventVenue: z.string().min(1, 'Venue is required'),
        eventDate: z.string().min(1, 'Event date is required'),
        eventTime: z.string().min(1, 'Event time is required'),
    })
    .refine((data) => data.eventType !== 'other', {
        message: 'Please enter a custom event type',
        path: ['eventType'],
    });

const customerSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    customerEmailAddress: z.string().email('Invalid email'),
    customerPhoneNumber: z.string().min(1, 'Phone is required'),
});

function derivePaymentStatus(
    paymentPlan: BanquetWizardState['paymentPlan'],
    amountPaid: number,
    total: number,
): NonNullable<BookingForm['paymentStatus']> {
    if (amountPaid >= total && total > 0) return 'paid';
    if (amountPaid > 0 || paymentPlan === 'partial') return 'partial';
    if (paymentPlan === 'full') return 'paid';
    return 'pending';
}

export interface BanquetCreateBookingWizardProps {
    mode?: 'add' | 'update';
    bookingId?: number;
    initialValues?: Partial<BookingForm>;
    initialSkipMenu?: boolean;
    /** Open wizard on this step (1–6), e.g. 4 for amenities assignment */
    initialStep?: number;
    onSuccess?: (bookingId?: number) => void;
    onCancel?: () => void;
    onSubmitBooking?: (
        _payload: CreateBookingForm,
    ) => Promise<{ error?: string; message?: string }>;
}

function getPrimaryLabel(step: number): string {
    if (step === 5) return 'Proceed to Payment';
    if (step === 6) return 'Confirm Booking';
    if (step === 2 || step === 3 || step === 4) return 'Save & Continue';
    return 'Continue';
}

function showReadyToast() {
    toast.custom(() => (
        <Toast
            title="Ready"
            description="Add another customer for this booking"
            type="success"
        />
    ));
}

function clampWizardStep(n: number): number {
    if (!Number.isFinite(n)) return 1;
    return Math.min(6, Math.max(1, Math.round(n)));
}

export default function BanquetCreateBookingWizard({
    mode = 'add',
    bookingId,
    initialValues,
    initialSkipMenu = false,
    initialStep = 1,
    onSuccess,
    onCancel,
    onSubmitBooking,
}: Readonly<BanquetCreateBookingWizardProps>) {
    const [step, setStep] = useState(() => clampWizardStep(initialStep));
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState<BanquetWizardState>(() => {
        const base = bookingFormToWizardState(initialValues);
        return { ...base, skipMenu: initialSkipMenu || base.skipMenu };
    });

    useEffect(() => {
        if (initialValues) {
            const base = bookingFormToWizardState(initialValues);
            setState({ ...base, skipMenu: initialSkipMenu || base.skipMenu });
        }
    }, [initialValues, initialSkipMenu]);

    const patch = useCallback(
        <K extends keyof BanquetWizardState>(
            field: K,
            value: BanquetWizardState[K],
        ) => {
            setState((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const pricing = useMemo(
        () =>
            calculateBanquetPricing(
                state.amenities.filter((a) => Number(a.quantity) > 0),
                state.skipMenu
                    ? []
                    : state.food.filter((f) => Number(f.quantity) > 0),
                state.discount,
                {
                    serviceChargePercent: state.serviceChargePercent,
                    vatPercent: state.vatPercent,
                },
            ),
        [
            state.amenities,
            state.food,
            state.discount,
            state.skipMenu,
            state.serviceChargePercent,
            state.vatPercent,
        ],
    );

    useEffect(() => {
        setState((prev) => {
            if (prev.total === pricing.total && prev.tax === pricing.tax) {
                return prev;
            }
            return { ...prev, total: pricing.total, tax: pricing.tax };
        });
    }, [pricing.total, pricing.tax]);

    const validateStep = (n: number): boolean => {
        if (n === 1) {
            const r = eventSchema.safeParse(state);
            if (!r.success) {
                toast.custom(() => (
                    <Toast
                        title="Validation"
                        description={r.error.errors[0]?.message}
                        type="error"
                    />
                ));
                return false;
            }
        }
        if (n === 2) {
            const r = customerSchema.safeParse(state);
            if (!r.success) {
                toast.custom(() => (
                    <Toast
                        title="Validation"
                        description={r.error.errors[0]?.message}
                        type="error"
                    />
                ));
                return false;
            }
            const name =
                [state.firstName, state.lastName].filter(Boolean).join(' ') ||
                state.customerName;
            if (!name.trim()) {
                toast.custom(() => (
                    <Toast
                        title="Validation"
                        description="Customer name is required"
                        type="error"
                    />
                ));
                return false;
            }
            patch('customerName', name);
        }
        return true;
    };

    const goNext = () => {
        if (!validateStep(step)) return;
        if (step === 3 && state.skipMenu) {
            setStep(4);
            return;
        }
        if (step < 6) setStep(step + 1);
        else handleSubmit();
    };

    const goBack = () => {
        if (step === 1) {
            onCancel?.();
            return;
        }
        if (step === 4 && state.skipMenu) {
            setStep(2);
            return;
        }
        setStep(step - 1);
    };

    const resetCustomerFields = () => {
        setState((prev) => ({
            ...prev,
            firstName: '',
            lastName: '',
            customerName: '',
            customerEmailAddress: '',
            customerPhoneNumber: '',
            company: '',
            customerType: '',
            billingFirstName: '',
            billingLastName: '',
            billingAddress: '',
            billingState: '',
            billingCounty: '',
            billingPostalCode: '',
            billingCity: '',
            saveCustomer: false,
        }));
    };

    const handleSubmit = async () => {
        const eventValid = validateStep(1);
        const customerValid = validateStep(2);
        if (!eventValid || !customerValid) {
            setStep(eventValid ? 2 : 1);
            return;
        }

        const formSlice = wizardStateToBookingForm(state);
        const paymentStatus = derivePaymentStatus(
            state.paymentPlan,
            state.amountPaid,
            pricing.total,
        );

        const payload = buildBanquetBookingPayload(
            { ...formSlice, paymentStatus },
            {
                skipMenu: state.skipMenu,
                serviceChargePercent: state.serviceChargePercent,
                vatPercent: state.vatPercent,
                amountPaid: state.amountPaid,
                paymentPlan: state.paymentPlan,
                paymentMethod: state.paymentMethod,
                discountReason: state.discountReason,
            },
        );

        setIsLoading(true);
        try {
            let response: {
                error?: string;
                message?: string;
                booking?: { id?: number };
            };
            if (onSubmitBooking) {
                response = await onSubmitBooking(payload);
            } else if (mode === 'update' && bookingId) {
                response = await updateBanquetBooking(bookingId, payload);
            } else {
                response = await createBanquetBooking(payload);
            }

            if (response?.error) {
                const errorMessage =
                    response.error ||
                    'Failed to save booking. Please try again.';
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={errorMessage}
                        type="error"
                    />
                ));
                return;
            }
            toast.custom(() => (
                <Toast
                    title="Success"
                    description={`Booking ${mode === 'update' ? 'updated' : 'created'} successfully`}
                    type="success"
                />
            ));
            onSuccess?.(
                mode === 'update'
                    ? bookingId
                    : response.booking?.id ?? bookingId,
            );
        } catch {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const primaryLabel = getPrimaryLabel(step);

    const stepTitles: Record<number, { title: string; subtitle?: string }> = {
        1: { title: 'Event Information', subtitle: 'Create event' },
        2: {
            title: 'Customer Information',
            subtitle: 'Enter customer info',
        },
        3: { title: 'Menu Details', subtitle: 'Select food menu' },
        4: {
            title: 'Amenities Details',
            subtitle: 'Choose amenities for the event',
        },
        5: {
            title: 'Review Details',
            subtitle: 'Review and approve each section',
        },
        6: { title: 'Payment Info', subtitle: 'Select payment method' },
    };

    const selectedMenuCount = state.food.filter(
        (f) => Number(f.quantity) > 0,
    ).length;

    const headerAction =
        step === 5 ? (
            <Button
                type="button"
                variant="outline"
                className="text-orion-blue border-orion-blue"
                onClick={() => setStep(1)}
            >
                Edit booking
            </Button>
        ) : undefined;

    return (
        <WizardShell
            currentStep={step}
            title={stepTitles[step]?.title ?? ''}
            subtitle={stepTitles[step]?.subtitle}
            onBack={goBack}
            onPrimary={goNext}
            primaryLabel={primaryLabel}
            backDisabled={isLoading}
            isLoading={isLoading}
            onStepClick={(s) => setStep(s)}
            headerAction={headerAction}
            centerSlot={
                step === 3 && !state.skipMenu ? (
                    <span className="text-sm text-muted-foreground">
                        {selectedMenuCount} item
                        {selectedMenuCount === 1 ? '' : 's'} selected
                    </span>
                ) : undefined
            }
            secondaryAction={
                step === 2
                    ? {
                          label: 'Save & add another',
                          onClick: () => {
                              if (!validateStep(2)) return;
                              resetCustomerFields();
                              showReadyToast();
                          },
                      }
                    : undefined
            }
        >
            {step === 1 && <EventStep state={state} onChange={patch} />}
            {step === 2 && <CustomerStep state={state} onChange={patch} />}
            {step === 3 && <MenuStep state={state} onChange={patch} />}
            {step === 4 && <AmenitiesStep state={state} onChange={patch} />}
            {step === 5 && (
                <ReviewStep
                    state={state}
                    onChange={patch}
                    onEditStep={setStep}
                />
            )}
            {step === 6 && <PaymentStep state={state} onChange={patch} />}
        </WizardShell>
    );
}
