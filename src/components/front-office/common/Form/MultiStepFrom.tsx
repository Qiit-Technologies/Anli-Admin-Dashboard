/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { createReservation, editReservation } from '@/app/actions/reservation';
import { completeDraftInvoiceConversion } from '@/app/actions/draft-invoices';
import { GuestProfile } from '@/app/actions/guest-profile';
import { getCustomCharges } from '@/app/actions/hotel';
import { applyWaiver } from '@/app/actions/guest';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useUser } from '@/context/useUser';
import useHotel from '@/hooks/useHotel';
import {
    IA_SOURCE_MODULES,
    maybePostBillToInternalAccount,
} from '@/lib/internal-accounts/post-bill';
import { isInternalAccountPaymentMethod } from '@/lib/internal-accounts/settlement';
import { formatBankAccountLabel, formatCurrency } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'nextjs-toploader/app';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { getAllBankAccounts } from '@/app/actions/bank-accounts';
import {
    FormDataType,
    MultiStepFormProps,
    StepperItem,
    steps,
} from './Reservation';
import { defaultFormData } from './Reservation/formDefaults';
import { useFormState } from './Reservation/hooks/useFormState';
import { useFormValidation } from './Reservation/hooks/useFormValidation';
import { useGuestAutoFill } from './Reservation/hooks/useGuestAutoFill';
import { useGuestSearch } from './Reservation/hooks/useGuestSearch';
import { usePaymentCalculations } from './Reservation/hooks/usePaymentCalculation';
import { useReservationType } from './Reservation/hooks/useReservationTypes';
import { useRoomOptions } from './Reservation/hooks/useRoomOptions';
import { useRoomTypes } from './Reservation/hooks/useRoomTypes';
import { useStepNavigation } from './Reservation/hooks/useStepNavigation';
import {
    ReservationTypeSelector,
    type ReservationTypeChoice,
} from './Reservation/ReservationTypeSelector';
import { GuestInformationStep } from './Reservation/steps/guest-information';
// import { GuestPreferencesStep } from './Reservation/steps/guest-preferences';
import { PaymentMethodStep } from './Reservation/steps/payment-information';
import { ReservationDetailsStep } from './Reservation/steps/reservation-information';
import { GuestID } from './Reservation/steps/guest-id';
import { inferReservationTypeFromPayload } from '@/lib/front-office/draft-payload-mapper';
import { CreateGroupBookingForm } from '@/components/front-office/group-reservation/form/CreateGroupBookingForm';
import { ManagerPinDialog } from '@/components/stock/common/modal/ManagerPinDialog';

export function MultiStepForm({
    guestDetails,
    date,
    roomType,
    onClose,
    onGroupCreated,
    mode = 'add',
    initialValues,
    initialStep = 1,
    skipTypeSelection = false,
    draftInvoiceId,
    onConversionComplete,
}: MultiStepFormProps) {
    const hotel = useHotel();
    const user = useUser();
    const isAdmin = user.user?.roles.name === 'administrator';
    const router = useRouter();

    const [typeSelected, setTypeSelected] = useState(
        mode === 'update' || skipTypeSelection,
    );
    const [isGroupFlow, setIsGroupFlow] = useState(false);
    const [IDNumber, setIDNumber] = useState(
        guestDetails?.IDNumber || String(initialValues?.IDNumber || ''),
    );
    const [selectedFile, setSelectedFile] = useState<File | undefined>(
        undefined,
    );
    const [imagePreview, setImagePreview] = useState<string | undefined>(
        guestDetails?.IDImage || undefined,
    );
    const [selectedProfile, setSelectedProfile] = useState<GuestProfile | null>(
        null,
    );
    const [applyCredit, setApplyCredit] = useState(false);
    const [waiverData, setWaiverData] = useState<{
        vat: boolean;
        serviceCharge: boolean;
        tip: boolean;
        customCharges: boolean;
        waiverReason: string;
    }>({
        vat: false,
        serviceCharge: false,
        tip: false,
        customCharges: false,
        waiverReason: '',
    });

    const {
        roomTypes,
        selectedRoom,
        setSelectedRoom,
        setSelectedRoomType,
        setSelectedRoomTypeId,
    } = useRoomTypes();

    const { formData, setFormData, errors, setErrors } = useFormState({
        mode,
        guestDetails,
        date,
        roomType,
        initialValues,
        roomTypes,
        defaultFormData,
    });
    const {
        guestHistory,
        setGuestHistory,
        searchingGuest,
        searchQuery,
        setSearchQuery,
        showResults,
        setShowResults,
    } = useGuestSearch();

    const { reservationType, setReservationType, setFormFlags } =
        useReservationType({
            mode,
            setFormData,
            preserveFormFlags: skipTypeSelection,
        });
    const isSpecialReservation =
        reservationType === 'DISCOUNT' ||
        reservationType === 'COMPLIMENTARY' ||
        reservationType === 'VOID';
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const pendingManagerPin = useRef<string | null>(null);

    const { roomOptions, filteredRooms } = useRoomOptions({
        formData,
        roomTypes,
        mode,
    });

    const { stepIndex, setStepIndex } = useStepNavigation(
        steps.length,
        initialStep,
    );

    // Skip step 2 (Guest Preferences) in navigation
    // Step mapping: 1→Guest Info, 2→Reservation Details, 3→Guest ID, 4→Payment
    const nextStep = () => {
        if (stepIndex === 1) {
            setStepIndex(3); // Step 1 → Step 3 (Reservation Details, displayed as step 2)
        } else if (stepIndex === 3) {
            setStepIndex(4); // Step 3 → Step 4 (Guest ID, displayed as step 3)
        } else if (stepIndex === 4) {
            setStepIndex(5); // Step 4 → Step 5 (Payment Method, displayed as step 4)
        }
    };

    const prevStep = () => {
        if (stepIndex === 5) {
            setStepIndex(4); // Step 5 → Step 4 (Guest ID)
        } else if (stepIndex === 4) {
            setStepIndex(3); // Step 4 → Step 3 (Reservation Details)
        } else if (stepIndex === 3) {
            setStepIndex(1); // Step 3 → Step 1 (Guest Info, skip step 2)
        }
    };

    const isPrevDisabled = stepIndex === 1;
    const isLastStep = stepIndex === 5;

    const { handleInputChange, validateStep } = useFormValidation({
        steps,
        setErrors,
    });

    const { autoFillGuestData } = useGuestAutoFill({
        setFormData,
        setErrors,
        setGuestHistory,
        steps,
        onProfileSelected: (profile) => {
            setSelectedProfile(profile);
            // Also update formData with guestProfileId
            if (profile) {
                setFormData((prev: any) => ({
                    ...prev,
                    guestProfileId: profile.id,
                }));
            } else {
                setFormData((prev: any) => ({
                    ...prev,
                    guestProfileId: undefined,
                    creditToApply: 0,
                }));
            }
        },
    });

    const hotelVatRate = Number(
        hotel.organization?.frontOfficeVatRate ??
        hotel.organization?.vatRate ??
        0,
    );
    const hotelServiceChargeRate = Number(
        hotel.organization?.frontOfficeServiceChargeRate ??
        hotel.organization?.serviceChargeRate ??
        0,
    );
    const hotelTipRate = Number(
        hotel.organization?.frontOfficeTipRate ??
        hotel.organization?.tipRate ??
        0,
    );

    // Fetch custom charges
    const { data: customChargesData } = useSWR('custom-charges', async () => {
        const result = await getCustomCharges();
        if ('error' in result) {
            console.error('Error fetching custom charges:', result.error);
            return [];
        }
        return (result.data || []).filter(
            (charge: any) => charge.isActive === true,
        );
    });

    const { outstandingAmount, discountCalculations, updatePayment } =
        usePaymentCalculations({
            formData,
            roomTypes,
            roomType,
            guestDetails,
            vatRate: hotelVatRate,
            serviceChargeRate: hotelServiceChargeRate,
            tipRate: hotelTipRate,
            customCharges: customChargesData || [],
            selectedRoom,
        });

    // Update outstanding in formData whenever outstandingAmount changes
    // IMPORTANT: Store outstanding BEFORE credit is applied
    // The backend needs this to create receivable correctly
    // The backend will handle credit application separately
    React.useEffect(() => {
        // Store outstanding amount BEFORE credit is applied
        // This ensures backend receives the correct outstanding for receivable creation
        if (formData.outstanding !== outstandingAmount) {
            setFormData((prev: any) => ({
                ...prev,
                outstanding: outstandingAmount, // Outstanding BEFORE credit
            }));
        }
    }, [
        outstandingAmount,
        formData.amountPaid,
        formData.startDate,
        formData.endDate,
        formData.roomtype,
        formData.discountType,
        formData.discountValue,
    ]);

    const [loadingCreateReservation, setLoadingCreateReservation] =
        useState(false);

    const { data: bankAccounts = [] } = useSWR('/accounts', getAllBankAccounts);
    const remappedBankAccounts =
        (bankAccounts as Array<any>)?.map((account) => ({
            label: formatBankAccountLabel(account),
            value: account.accountNumber?.toString() || '',
        })) || [];

    const currentSchema = steps[stepIndex - 1].schema;

    const handleDocumentUpload = async (): Promise<string> => {
        if (!selectedFile) return '';

        const documentFormData = new FormData();
        documentFormData.append('file', selectedFile);
        documentFormData.append('upload_preset', 'anli_default');

        try {
            const uploadResponse = await fetch(
                'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                {
                    method: 'POST',
                    body: documentFormData,
                },
            );
            const documentData = await uploadResponse.json();
            return documentData.secure_url;
        } catch (error: any) {
            toast.error('Document upload failed');
            throw error;
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const currentStepData: any = {};
            const schemaShape = (
                currentSchema instanceof z.ZodObject
                    ? currentSchema
                    : (currentSchema as z.ZodEffects<any>).innerType()
            ).shape;

            // Extract only the fields that belong to this step's schema
            Object.keys(schemaShape).forEach((key) => {
                currentStepData[key] = formData[key as keyof typeof formData];
            });

            if (!validateStep(currentSchema, currentStepData)) {
                return;
            }

            if (!isLastStep) {
                nextStep();
                return;
            }

            setLoadingCreateReservation(true);

            let IDImage = '';
            if (selectedFile) {
                IDImage = await handleDocumentUpload();
                console.log('IDImage', IDImage);
            }

            try {
                // Calculate final outstanding before submission (accounting for credit)
                // Send outstanding BEFORE credit is applied
                // outstandingAmount already includes all fees (VAT, service charge, tips, custom charges)
                // The backend will apply credit and create receivable based on the outstanding amount
                // formData.outstanding should already be set to outstandingAmount (before credit) by the useEffect

                let response;
                // Convert phone numbers from string to number for API compatibility
                // The API function handles type conversion, so we use a type assertion
                type ReservationModalFormDataType =
                    import('@/app/dashboard/components/FrontOffice/dashboard/ReservationModal').FormDataType;

                // Ensure outstanding is set correctly (before credit application)
                // Use outstandingAmount directly to ensure it includes all fees
                const finalOutstanding =
                    outstandingAmount || formData.outstanding || 0;
                console.log(formData);
                const submissionData = {
                    ...formData,
                    // Send outstanding BEFORE credit is applied
                    // This includes: (originalPrice * nights) - discount + VAT + service charge + tips + custom charges - amountPaid
                    outstanding: finalOutstanding,
                    IDNumber,
                    IDImage,
                    phoneNumber: formData.phoneNumber || '',
                    secondGuestPhoneNumber:
                        formData.secondGuestPhoneNumber || '',
                    // Include guestProfileId and creditToApply if profile is selected
                    guestProfileId: selectedProfile?.id,
                    creditToApply: formData.creditToApply || 0,
                    includeTip: !!formData.includeTip,
                    includeVat: formData.includeVat !== false,
                    managerPin: pendingManagerPin.current || undefined,
                } as ReservationModalFormDataType & {
                    IDNumber?: string;
                    IDImage?: string;
                    guestProfileId?: number;
                    creditToApply?: number;
                    includeTip?: boolean;
                    includeVat?: boolean;
                    managerPin?: string;
                };
                pendingManagerPin.current = null;

                if (mode === 'update' && guestDetails) {
                    response = await editReservation(
                        guestDetails.id,
                        submissionData,
                    );
                } else {
                    response = await createReservation(submissionData);
                }

                if (
                    response.message === 'Reservation created successfully!' ||
                    response.message === 'Reservation updated successfully!'
                ) {
                    const paidAmount = Number(formData.amountPaid || 0);
                    const reservationTotal = Number(
                        formData.outstanding != null &&
                            formData.amountPaid != null
                            ? Number(formData.amountPaid) +
                            Number(formData.outstanding || 0)
                            : formData.finalPrice ||
                            formData.totalWithCustomCharges ||
                            formData.totalWithTip ||
                            paidAmount ||
                            0,
                    );

                    // Apply waiver if any charges were waived
                    const guestId =
                        'guestId' in response &&
                            typeof response.guestId === 'number'
                            ? response.guestId
                            : guestDetails?.id;

                    if (
                        guestId &&
                        (waiverData?.vat ||
                            formData.includeVat === false ||
                            waiverData?.serviceCharge ||
                            waiverData?.tip ||
                            waiverData?.customCharges)
                    ) {
                        try {
                            await applyWaiver(guestId, {
                                vat:
                                    waiverData?.vat ||
                                    formData.includeVat === false,
                                serviceCharge: waiverData?.serviceCharge,
                                tip: waiverData?.tip,
                                customCharges: waiverData?.customCharges,
                                waiverReason: waiverData?.waiverReason || undefined,
                            });
                        } catch (waiverError) {
                            console.error('Failed to apply waiver:', waiverError);
                            toast.custom(() => (
                                <Toast
                                    title="Waiver failed"
                                    description="Reservation saved but charge waiver could not be applied. Please apply it manually from the guest profile."
                                    type="error"
                                />
                            ));
                        }
                    }

                    const iaBillAmount = Math.max(paidAmount, reservationTotal);
                    if (
                        mode !== 'update' &&
                        isInternalAccountPaymentMethod(formData.paymentMethod) &&
                        iaBillAmount > 0
                    ) {
                        const guestRef =
                            'guestId' in response &&
                                typeof response.guestId === 'number'
                                ? response.guestId
                                : guestDetails?.id;
                        if (!guestRef) {
                            toast.custom(() => (
                                <Toast
                                    title="Reservation saved"
                                    description="Reservation saved but Internal Account approval could not be requested (missing guest id)."
                                    type="error"
                                />
                            ));
                        } else {
                            const iaPost = await maybePostBillToInternalAccount({
                                paymentMethod: formData.paymentMethod,
                                receivingAccount: formData.receivingAccount,
                                billAmount: iaBillAmount,
                                sourceModule: IA_SOURCE_MODULES.RESERVATIONS,
                                guestCustomer: formData.fullName || 'Guest',
                                roomTableNo: formData.roomNumber
                                    ? `Room ${formData.roomNumber}`
                                    : null,
                                postedBy: user.user?.fullName || 'Front Desk',
                                referenceId: guestRef,
                            });
                            if (iaPost.error) {
                                toast.custom(() => (
                                    <Toast
                                        title="Reservation saved"
                                        description={`Reservation saved but Internal Account posting failed: ${iaPost.error}`}
                                        type="error"
                                    />
                                ));
                            } else if (!iaPost.skipped) {
                                toast.custom(() => (
                                    <Toast
                                        title="Approval requested"
                                        description="Internal Account bill posted and is awaiting approval."
                                        type="success"
                                    />
                                ));
                                mutate('pending-ia-bill-approvals');
                            }
                        }
                    }

                    if (
                        draftInvoiceId &&
                        'guestId' in response &&
                        typeof response.guestId === 'number'
                    ) {
                        const conversion = await completeDraftInvoiceConversion(
                            draftInvoiceId,
                            response.guestId,
                        );
                        if (conversion.error) {
                            toast.custom(() => (
                                <Toast
                                    title="Reservation saved"
                                    description={`Reservation was created but the draft could not be updated: ${conversion.error}`}
                                    type="error"
                                />
                            ));
                        } else {
                            onConversionComplete?.();
                        }
                    }

                    const getReservationType = (
                        data: Partial<FormDataType>,
                    ): string => {
                        if (data.isComplimentary)
                            return 'Complimentary reservation';
                        if (data.isVoid) return 'Voided reservation';
                        if (data.discountType) return 'Discounted reservation';
                        if (data.isWalkIn)
                            return 'Guest Checked-In Automatically';
                        return 'Regular reservation';
                    };

                    const typeDescription = getReservationType(formData);

                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={
                                typeDescription
                                    ? `${typeDescription} ${guestDetails ? 'updated' : 'created'
                                    } successfully.`
                                    : response.message
                            }
                            type="success"
                        />
                    ));

                    setLoadingCreateReservation(false);
                    if (onClose) {
                        onClose();
                    }
                    mutate('/hotelRooms');
                    mutate('/rooms');
                    mutate('/activity-log');
                    mutate('list-data');
                    router.refresh();
                } else {
                    setLoadingCreateReservation(false);
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            } catch (error: any) {
                setLoadingCreateReservation(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={`Failed to ${guestDetails ? 'update' : 'create'
                            } reservation. Please try again.`}
                        type="error"
                    />
                ));
                console.error('Error submitting reservation:', error);
            }
        } catch (error: any) {
            console.error('Form validation error:', error);
        }
    };

    const wrappedHandleInputChange = (field: string, value: any) => {
        handleInputChange(field, value, formData, setFormData);
    };

    const wrappedUpdatePayment = (field: string, value: string) => {
        updatePayment(field, value, setFormData);
    };

    const validateCurrentStep = (): boolean => {
        const currentStepData: Record<string, unknown> = {};
        const schemaShape = (
            currentSchema instanceof z.ZodObject
                ? currentSchema
                : (currentSchema as z.ZodEffects<any>).innerType()
        ).shape;

        Object.keys(schemaShape).forEach((key) => {
            currentStepData[key] = formData[key as keyof typeof formData];
        });

        return validateStep(currentSchema, currentStepData);
    };

    const inputClass = 'bg-white shadow-none border-gray-300';

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleTypeSelection = (type: ReservationTypeChoice) => {
        if (type === 'GROUP') {
            setIsGroupFlow(true);
            setTypeSelected(true);
            return;
        }

        setReservationType(type);
        switch (type) {
            case 'COMPLIMENTARY':
                setFormFlags({ isComplimentary: true });
                break;
            case 'DISCOUNT':
                setFormFlags({ discountType: 'PERCENTAGE' });
                break;
            case 'REGULAR':
            default:
                setFormFlags({});
                break;
        }
        setTypeSelected(true);
    };

    useEffect(() => {
        if (!skipTypeSelection || mode === 'update') return;
        const payload = (initialValues ?? {}) as Record<string, unknown>;
        setReservationType(inferReservationTypeFromPayload(payload));
        setTypeSelected(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for draft convert preload
    }, []);

    if (mode !== 'update' && !typeSelected) {
        return (
            <ReservationTypeSelector
                isAdmin={isAdmin}
                setReservationType={(type) => handleTypeSelection(type)}
                setFormFlags={setFormFlags}
            />
        );
    }

    if (isGroupFlow) {
        return (
            <CreateGroupBookingForm
                onCreated={(groupCode) => {
                    onGroupCreated?.(groupCode);
                    void onClose?.();
                }}
                onCancel={() => {
                    setIsGroupFlow(false);
                    setTypeSelected(false);
                }}
            />
        );
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex w-full flex-start gap-2">
                {steps
                    .filter((step) => step.step !== 2) // Hide step 2 (Guest Preferences)
                    .map((step) => {
                        // Map step numbers for display:
                        // step 1 → display as 1 (Guest Info)
                        // step 3 → display as 2 (Reservation Details)
                        // step 4 → display as 3 (Guest ID)
                        // step 5 → display as 4 (Payment Method)
                        const displayStep =
                            step.step > 2 ? step.step - 1 : step.step;
                        // Map current stepIndex for display:
                        // stepIndex 1 → display as 1
                        // stepIndex 3 → display as 2
                        // stepIndex 4 → display as 3
                        // stepIndex 5 → display as 4
                        const displayStepIndex =
                            stepIndex === 1
                                ? 1
                                : stepIndex === 3
                                    ? 2
                                    : stepIndex === 4
                                        ? 3
                                        : stepIndex === 5
                                            ? 4
                                            : stepIndex;
                        return (
                            <StepperItem
                                key={step.step}
                                step={{
                                    ...step,
                                    step: displayStep,
                                }}
                                currentStep={displayStepIndex}
                                totalSteps={steps.length - 1}
                                isValid={Object.keys(errors).length === 0}
                                onClick={() => {
                                    // Map display step back to actual step
                                    const targetStep =
                                        step.step === 1
                                            ? 1
                                            : step.step === 3
                                                ? 3
                                                : step.step === 4
                                                    ? 4
                                                    : step.step === 5
                                                        ? 5
                                                        : step.step;
                                    if (targetStep < stepIndex) {
                                        setStepIndex(targetStep);
                                    }
                                }}
                            />
                        );
                    })}
            </div>

            <div className="flex flex-col gap-4 mt-4 w-full max-h-[450px] overflow-y-auto">
                {stepIndex === 1 && (
                    <GuestInformationStep
                        formData={formData}
                        handleInputChange={wrappedHandleInputChange}
                        errors={errors}
                        autoFillGuestData={autoFillGuestData}
                        guestHistory={guestHistory}
                        inputClass={inputClass}
                        searchQuery={searchQuery}
                        searchingGuest={searchingGuest}
                        setSearchQuery={setSearchQuery}
                        setGuestHistory={setGuestHistory}
                        setShowResults={setShowResults}
                        showResults={showResults}
                    />
                )}

                {/* {stepIndex === 2 && (
                    <GuestPreferencesStep
                        formData={formData}
                        handleInputChange={wrappedHandleInputChange}
                        inputClass={inputClass}
                        errors={errors}
                    />
                )} */}

                {stepIndex === 3 && (
                    <div className="flex flex-col gap-4">
                        <ReservationDetailsStep
                            formData={formData}
                            handleInputChange={wrappedHandleInputChange}
                            errors={errors}
                            inputClass={inputClass}
                            filteredRooms={filteredRooms}
                            setSelectedRoomTypeId={setSelectedRoomTypeId}
                            setSelectedRoomType={setSelectedRoomType}
                            setSelectedRoom={setSelectedRoom}
                            mode={mode}
                            getTodayDate={getTodayDate}
                            hotel={hotel}
                            roomOptions={roomOptions}
                            roomTypes={roomTypes}
                            isAdmin={isAdmin}
                            reservationType={reservationType}
                        />
                    </div>
                )}

                {stepIndex === 4 && (
                    <div className="flex flex-col gap-4">
                        <GuestID
                            inputClass={inputClass}
                            IDNumber={IDNumber}
                            setIDNumber={setIDNumber}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            imagePreview={imagePreview}
                            setImagePreview={setImagePreview}
                        />
                    </div>
                )}

                {stepIndex === 5 && (
                    <PaymentMethodStep
                        formData={formData}
                        handleInputChange={wrappedHandleInputChange}
                        errors={errors}
                        inputClass={inputClass}
                        outstandingAmount={outstandingAmount}
                        discountCalculations={discountCalculations}
                        updatePayment={wrappedUpdatePayment}
                        formatCurrency={formatCurrency}
                        remappedBankAccounts={remappedBankAccounts}
                        reservationType={reservationType || 'REGULAR'}
                        selectedProfile={selectedProfile}
                        applyCredit={applyCredit}
                        onApplyCreditChange={(apply) => {
                            setApplyCredit(apply);
                        }}
                        waiverData={waiverData}
                        onWaiverChange={setWaiverData}
                    />
                )}
            </div>

            <div className="flex items-center justify-between mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isPrevDisabled}
                >
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    {stepIndex === steps.length &&
                        isSpecialReservation &&
                        !guestDetails && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={loadingCreateReservation}
                                onClick={() => setPinDialogOpen(true)}
                            >
                                Add PIN
                            </Button>
                        )}
                    <Button
                        disabled={loadingCreateReservation}
                        className="bg-orion-blue hover:bg-orion-blue"
                        type="submit"
                    >
                        {loadingCreateReservation ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            ''
                        )}
                        {stepIndex === steps.length
                            ? guestDetails
                                ? 'Update'
                                : loadingCreateReservation
                                    ? 'Creating...'
                                    : isSpecialReservation
                                        ? 'Create Without PIN'
                                        : 'Create'
                            : 'Continue'}
                    </Button>
                </div>
            </div>
            <ManagerPinDialog
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                title="Approve with manager PIN"
                description="Enter a valid 4-digit Manager/Admin PIN to approve this discount or complimentary reservation now."
                confirmLabel="Create with PIN"
                isLoading={loadingCreateReservation}
                onConfirm={async (pin) => {
                    pendingManagerPin.current = pin;
                    setPinDialogOpen(false);
                    const form = document.querySelector(
                        'form.space-y-6',
                    ) as HTMLFormElement | null;
                    form?.requestSubmit();
                }}
            />
        </form>
    );
}
