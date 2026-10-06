import {
    createBanquetBooking,
    updateBanquetBooking,
} from '@/app/actions/banquet-booking';
import { calculateBanquetPricing } from '@/components/banquest/utils/banquet-pricing';
import { buildBanquetBookingPayload } from '@/components/banquest/utils/build-booking-payload';
import { InputField, SelectField } from '@/components/common/Form';
import StepperItem from '@/components/common/Form/StepperItem';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { BookingForm, CreateBookingForm } from '../../types';
import AmenitiesSearch from '../AmenitiesSearch';
import CustomerSearcher from '../CustomerSearcher';
import FoodSelect from '../FoodSelect';
import PaymentSummary from '../PaymentSummary';
import ReviewDetails from '../ReviewDetails';

const eventInfoSchema = z.object({
    eventName: z.string().min(1, { message: 'Event name is required' }),
    eventType: z.string().min(1, { message: 'Event type is required' }),
    eventVenue: z.string().min(1, { message: 'Event venue is required' }),
    eventDate: z.string().min(1, { message: 'Event date is required' }),
    eventTime: z.string().min(1, { message: 'Event time is required' }),
});

const customerInfoSchema = z.object({
    customerTitle: z.string().min(1, { message: 'Customer title is required' }),
    customerName: z.string().min(1, { message: 'Customer name is required' }),
    customerEmailAddress: z
        .string()
        .email({ message: 'Invalid email address' }),
    customerPhoneNumber: z
        .string()
        .min(1, { message: 'Phone number is required' }),
});

const menuDetailsSchema = z.object({
    cuisineType: z.string().optional(),
    menuName: z.string().optional(),
    menuType: z.string().optional(),
});

const amenitiesSchema = z.object({
    amenities: z.array(
        z.object({
            name: z.string(),
            available: z.union([z.string(), z.number()]),
            cost: z.string(),
            quantity: z.string(),
        }),
    ),
    total: z.number().min(0, { message: 'Total amount is required' }),
    discount: z.number().min(0, { message: 'Discount must be 0 or greater' }),
    tax: z.number().min(0, { message: 'Tax must be 0 or greater' }),
});

const steps = [
    {
        step: 1,
        title: 'Event',
        description: 'Event information',
        schema: eventInfoSchema,
    },
    {
        step: 2,
        title: 'Customer',
        description: 'Customer details',
        schema: customerInfoSchema,
    },
    {
        step: 3,
        title: 'Menu',
        description: 'Optional menu',
        schema: menuDetailsSchema,
        optional: true,
    },
    {
        step: 4,
        title: 'Amenities',
        description: 'Amenities & pricing',
        schema: amenitiesSchema,
    },
    {
        step: 5,
        title: 'Review',
        description: 'Review & confirm',
    },
    {
        step: 6,
        title: 'Payment',
        description: 'Payment information',
    },
];

interface BookingFormProps {
    mode?: 'add' | 'update';
    layout?: 'page' | 'embedded';
    bookingId?: number;
    initialValues?: Partial<BookingForm>;
    initialSkipMenu?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
    onSubmitBooking?: (
        payload: CreateBookingForm,
    ) => Promise<{ error?: string; message?: string }>;
}

const BookingMultiStepForm = ({
    mode = 'add',
    layout = 'embedded',
    bookingId,
    initialValues,
    initialSkipMenu = false,
    onSuccess,
    onCancel,
    onClose,
    onSubmitBooking,
}: BookingFormProps) => {
    const [stepIndex, setStepIndex] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [skipMenu, setSkipMenu] = useState(initialSkipMenu);
    const [formData, setFormData] = useState<Partial<BookingForm>>({
        eventName: '',
        eventType: '',
        eventVenue: '',
        eventDate: new Date().toISOString().split('T')[0],
        eventTime: '',
        customerTitle: 'Mr',
        customerName: '',
        customerEmailAddress: '',
        customerPhoneNumber: '',
        cuisineType: '',
        menuName: '',
        menuType: '',
        amenities: [],
        food: [],
        total: 0,
        discount: 0,
        tax: 0,
        paymentStatus: 'pending',
        bookingStatus: 'confirmed',
    });

    useEffect(() => {
        if (initialValues) {
            setFormData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                    Object.entries(initialValues).map(([key, value]) => [
                        key,
                        value === null ? '' : value,
                    ]),
                ),
                eventDate:
                    initialValues.eventDate ||
                    new Date().toISOString().split('T')[0],
                customerTitle: initialValues.customerTitle || 'Mr',
                total: initialValues.total || 0,
                discount: initialValues.discount || 0,
                tax: initialValues.tax || 0,
                amenities: initialValues.amenities || [],
                food: initialValues.food || [],
            }));
        }
    }, [initialValues]);

    useEffect(() => {
        setSkipMenu(initialSkipMenu);
    }, [initialSkipMenu]);

    const pricingPreview = useMemo(
        () =>
            calculateBanquetPricing(
                formData.amenities ?? [],
                skipMenu ? [] : (formData.food ?? []),
                formData.discount ?? 0,
                formData.tax ?? 0,
            ),
        [
            formData.amenities,
            formData.food,
            formData.discount,
            formData.tax,
            skipMenu,
        ],
    );

    useEffect(() => {
        setFormData((prev) => {
            if (prev.total === pricingPreview.total) return prev;
            return { ...prev, total: pricingPreview.total };
        });
    }, [pricingPreview.total]);

    const handleInputChange = (field: keyof BookingForm, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const shouldValidateStep = (step: (typeof steps)[number]) => {
        if (!step.schema) return false;
        if (step.step === 3 && skipMenu) return false;
        return true;
    };

    const validateCurrentStep = () => {
        const currentStep = steps[stepIndex - 1];
        if (!shouldValidateStep(currentStep)) return true;

        const validationResult = currentStep.schema?.safeParse(formData);
        if (!validationResult?.success) {
            setError(validationResult?.error?.errors[0].message ?? 'Invalid');
            toast.custom(() => (
                <Toast
                    title="Validation Error"
                    description={
                        validationResult?.error?.errors[0]?.message ??
                        'Invalid input'
                    }
                    type="error"
                />
            ));
            return false;
        }
        setError(null);
        return true;
    };

    const handleSkipMenuChange = (checked: boolean) => {
        setSkipMenu(checked);
        if (checked) {
            setFormData((prev) => ({
                ...prev,
                cuisineType: '',
                menuName: '',
                menuType: '',
                food: [],
            }));
        }
    };

    const handleNextStep = () => {
        if (stepIndex < steps.length) {
            if (!validateCurrentStep()) return;
            setStepIndex(stepIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const allValid = steps.every((step) => {
            if (!shouldValidateStep(step)) return true;
            return step.schema!.safeParse(formData).success;
        });

        if (!allValid) {
            setError('Please fill all required fields correctly.');
            toast.custom(() => (
                <Toast
                    title="Validation Error"
                    description="Please fill all required fields correctly."
                    type="error"
                />
            ));
            return;
        }

        const payload = buildBanquetBookingPayload(formData, { skipMenu });

        setIsLoading(true);
        try {
            const response = onSubmitBooking
                ? await onSubmitBooking(payload)
                : mode === 'update' && bookingId
                  ? await updateBanquetBooking(bookingId, payload)
                  : await createBanquetBooking(payload);

            if (response?.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={response.error}
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

            onSuccess?.();
            onClose?.();
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

    const footer = (
        <div
            className={cn(
                'flex items-center justify-between gap-4 mt-6',
                layout === 'page' &&
                    'sticky bottom-0 bg-background border-t py-4 -mx-4 px-4',
            )}
        >
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStepIndex(stepIndex - 1)}
                    disabled={stepIndex === 1}
                >
                    Back
                </Button>
                {(onCancel || onClose) && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel ?? onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
            </div>
            <Button
                className="bg-orion-blue hover:bg-orion-blue"
                type="button"
                disabled={isLoading}
                onClick={handleNextStep}
            >
                {isLoading && (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                )}
                {stepIndex === steps.length
                    ? mode === 'update'
                        ? 'Update booking'
                        : 'Create booking'
                    : 'Continue'}
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex w-full flex-nowrap gap-2 overflow-x-auto pb-2">
                {steps.map((step) => (
                    <StepperItem
                        key={step.step}
                        step={step}
                        currentStep={stepIndex}
                        totalSteps={steps.length}
                        isValid={!error}
                        onClick={() => {
                            if (step.step < stepIndex) {
                                setStepIndex(step.step);
                            }
                        }}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-4">
                {stepIndex === 1 && (
                    <div className="flex flex-col gap-4 border rounded-lg p-4 md:p-6">
                        <span className="text-sm font-semibold">
                            Event information
                        </span>

                        <InputField
                            id="eventName"
                            label="Event name"
                            placeholder="e.g. Annual Company Party"
                            type="text"
                            name="eventName"
                            value={formData.eventName || ''}
                            onChange={(e) =>
                                handleInputChange('eventName', e.target.value)
                            }
                        />

                        <SelectField
                            id="eventType"
                            label="Event type"
                            name="eventType"
                            value={formData.eventType || ''}
                            onValueChange={(value) =>
                                handleInputChange('eventType', value)
                            }
                            options={[
                                { value: 'wedding', label: 'Wedding' },
                                {
                                    value: 'corporate',
                                    label: 'Corporate event',
                                },
                                { value: 'birthday', label: 'Birthday party' },
                                { value: 'conference', label: 'Conference' },
                                { value: 'other', label: 'Other' },
                            ]}
                        />

                        <InputField
                            id="eventVenue"
                            label="Event venue"
                            placeholder="e.g. Grand Ballroom"
                            type="text"
                            name="eventVenue"
                            value={formData.eventVenue || ''}
                            onChange={(e) =>
                                handleInputChange('eventVenue', e.target.value)
                            }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="eventDate"
                                label="Event date"
                                type="date"
                                name="eventDate"
                                value={formData.eventDate || ''}
                                onChange={(e) =>
                                    handleInputChange(
                                        'eventDate',
                                        e.target.value,
                                    )
                                }
                            />

                            <InputField
                                id="eventTime"
                                label="Event time"
                                type="time"
                                name="eventTime"
                                value={formData.eventTime || ''}
                                onChange={(e) =>
                                    handleInputChange(
                                        'eventTime',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                )}

                {stepIndex === 2 && (
                    <div className="flex flex-col gap-4 border rounded-lg p-4 md:p-6">
                        <CustomerSearcher
                            value={{
                                customerTitle: formData.customerTitle,
                                customerName: formData.customerName,
                                customerEmailAddress:
                                    formData.customerEmailAddress,
                                customerPhoneNumber:
                                    formData.customerPhoneNumber,
                            }}
                            onSelect={(customer) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    ...customer,
                                    customerTitle:
                                        customer.customerTitle ||
                                        prev.customerTitle,
                                }))
                            }
                        />

                        <SelectField
                            id="customerTitle"
                            label="Title"
                            name="customerTitle"
                            value={formData.customerTitle || 'Mr'}
                            onValueChange={(value) =>
                                handleInputChange('customerTitle', value)
                            }
                            options={[
                                { value: 'Mr', label: 'Mr' },
                                { value: 'Mrs', label: 'Mrs' },
                                { value: 'Ms', label: 'Ms' },
                                { value: 'Dr', label: 'Dr' },
                                { value: 'Prof', label: 'Prof' },
                            ]}
                        />

                        <InputField
                            id="customerName"
                            label="Full name"
                            placeholder="e.g. John Doe"
                            type="text"
                            name="customerName"
                            value={formData.customerName || ''}
                            onChange={(e) =>
                                handleInputChange(
                                    'customerName',
                                    e.target.value,
                                )
                            }
                        />

                        <InputField
                            id="customerEmailAddress"
                            label="Email address"
                            placeholder="name@example.com"
                            type="email"
                            name="customerEmailAddress"
                            value={formData.customerEmailAddress || ''}
                            onChange={(e) =>
                                handleInputChange(
                                    'customerEmailAddress',
                                    e.target.value,
                                )
                            }
                        />

                        <InputField
                            id="customerPhoneNumber"
                            label="Phone number"
                            placeholder="Phone number"
                            type="text"
                            name="customerPhoneNumber"
                            value={formData.customerPhoneNumber || ''}
                            onChange={(e) =>
                                handleInputChange(
                                    'customerPhoneNumber',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                )}

                {stepIndex === 3 && (
                    <div className="flex flex-col gap-4 border rounded-lg p-4 md:p-6">
                        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
                            <Checkbox
                                id="skipMenu"
                                checked={skipMenu}
                                onCheckedChange={(checked) =>
                                    handleSkipMenuChange(checked === true)
                                }
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor="skipMenu"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    No menu for this event
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Skip cuisine, menu type, and food options.
                                    You can continue without filling anything
                                    below.
                                </p>
                            </div>
                        </div>

                        {!skipMenu && (
                            <>
                                <span className="text-sm font-semibold">
                                    Menu details (optional)
                                </span>

                                <SelectField
                                    id="cuisineType"
                                    label="Cuisine type (optional)"
                                    name="cuisineType"
                                    value={formData.cuisineType || ''}
                                    onValueChange={(value) =>
                                        handleInputChange('cuisineType', value)
                                    }
                                    options={[
                                        {
                                            value: 'italian',
                                            label: 'Italian',
                                        },
                                        {
                                            value: 'chinese',
                                            label: 'Chinese',
                                        },
                                        {
                                            value: 'indian',
                                            label: 'Indian',
                                        },
                                        {
                                            value: 'mexican',
                                            label: 'Mexican',
                                        },
                                        {
                                            value: 'american',
                                            label: 'American',
                                        },
                                        {
                                            value: 'continental',
                                            label: 'Continental',
                                        },
                                    ]}
                                />

                                <InputField
                                    id="menuName"
                                    label="Menu name (optional)"
                                    placeholder="e.g. Deluxe wedding package"
                                    type="text"
                                    name="menuName"
                                    value={formData.menuName || ''}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'menuName',
                                            e.target.value,
                                        )
                                    }
                                />

                                <SelectField
                                    id="menuType"
                                    label="Menu type (optional)"
                                    name="menuType"
                                    value={formData.menuType || ''}
                                    onValueChange={(value) =>
                                        handleInputChange('menuType', value)
                                    }
                                    options={[
                                        { value: 'buffet', label: 'Buffet' },
                                        { value: 'plated', label: 'Plated' },
                                        {
                                            value: 'family-style',
                                            label: 'Family style',
                                        },
                                        {
                                            value: 'cocktail',
                                            label: 'Cocktail',
                                        },
                                    ]}
                                />

                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Food options (optional)
                                    </p>
                                    <FoodSelect
                                        value={formData.food ?? []}
                                        onChange={(food) =>
                                            handleInputChange('food', food)
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {stepIndex === 4 && (
                    <div className="flex flex-col gap-4 border rounded-lg p-4 md:p-6">
                        <span className="text-sm font-semibold">
                            Amenities & pricing
                        </span>
                        <AmenitiesSearch
                            value={formData.amenities ?? []}
                            onChange={(amenities) =>
                                handleInputChange('amenities', amenities)
                            }
                            food={skipMenu ? [] : (formData.food ?? [])}
                            discount={formData.discount ?? 0}
                            tax={formData.tax ?? 0}
                            onDiscountChange={(discount) =>
                                handleInputChange('discount', discount)
                            }
                            onTaxChange={(tax) => handleInputChange('tax', tax)}
                        />
                    </div>
                )}

                {stepIndex === 5 && (
                    <ReviewDetails
                        booking={formData}
                        onEdit={() => setStepIndex(1)}
                        onEditPricing={() => setStepIndex(4)}
                    />
                )}

                {stepIndex === 6 && (
                    <div className="flex flex-col gap-4 border rounded-lg p-4 md:p-6">
                        <span className="text-sm font-semibold">
                            Payment details
                        </span>
                        <PaymentSummary
                            amenities={formData.amenities || []}
                            food={skipMenu ? [] : formData.food || []}
                            discount={formData.discount ?? 0}
                            tax={formData.tax ?? 0}
                            total={formData.total ?? 0}
                            paymentStatus={formData.paymentStatus}
                            onPaymentStatusChange={(paymentStatus) =>
                                handleInputChange(
                                    'paymentStatus',
                                    paymentStatus,
                                )
                            }
                            onGoToAmenities={() => setStepIndex(4)}
                        />
                    </div>
                )}
            </div>

            {footer}
        </div>
    );
};

export default BookingMultiStepForm;
