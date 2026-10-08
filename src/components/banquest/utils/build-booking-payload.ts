import { Amenities, BookingForm, CreateBookingForm, Food } from '../types';
import { calculateBanquetPricing } from './banquet-pricing';

/** API DTO requires string fields on nested amenity/food lines. */
function normalizeAmenityForApi(a: Amenities): Amenities {
    return {
        ...a,
        name: String(a.name ?? '').trim(),
        available: String(a.available ?? ''),
        cost: String(a.cost ?? ''),
        quantity: String(a.quantity ?? '0'),
    };
}

function normalizeFoodForApi(f: Food): Food {
    return {
        ...f,
        name: String(f.name ?? '').trim(),
        description: f.description != null ? String(f.description) : '',
        cost: String(f.cost ?? ''),
        quantity: String(f.quantity ?? '0'),
    };
}

function extractApiErrorMessage(error: unknown): string {
    const err = error as {
        response?: { data?: { message?: string | string[] } };
    };
    const raw = err?.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string' && raw.length > 0) return raw;
    return 'An unexpected error occurred. Please try again.';
}

export { extractApiErrorMessage };

export function buildBanquetBookingPayload(
    formData: Partial<BookingForm>,
    options?: {
        skipMenu?: boolean;
        serviceChargePercent?: number;
        vatPercent?: number;
        amountPaid?: number;
        paymentPlan?: BookingForm['paymentPlan'];
        paymentMethod?: string;
        discountReason?: string;
    },
): CreateBookingForm {
    const skipMenu = options?.skipMenu ?? false;

    const amenities = (formData.amenities ?? [])
        .filter((a) => Number(a.quantity) > 0 && a.name.trim())
        .map(normalizeAmenityForApi);
    const food = skipMenu
        ? []
        : (formData.food ?? [])
              .filter((f) => Number(f.quantity) > 0 && f.name.trim())
              .map(normalizeFoodForApi);

    const serviceChargePercent =
        options?.serviceChargePercent ??
        formData.serviceChargePercent ??
        10;
    const vatPercent = options?.vatPercent ?? formData.vatPercent ?? 7.5;

    const pricing = calculateBanquetPricing(
        amenities,
        food,
        formData.discount ?? 0,
        { serviceChargePercent, vatPercent },
    );

    return {
        eventName: formData.eventName,
        eventType: formData.eventType,
        eventVenue: formData.eventVenue,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        eventEndTime: formData.eventEndTime || undefined,
        estimatedGuestCount: formData.estimatedGuestCount || undefined,
        setupTime: formData.setupTime || undefined,
        teardownTime: formData.teardownTime || undefined,
        eventCategory: formData.eventCategory || undefined,
        eventDescription: formData.eventDescription || undefined,
        customerTitle: formData.customerTitle,
        customerName: formData.customerName,
        customerEmailAddress: formData.customerEmailAddress,
        customerPhoneNumber: formData.customerPhoneNumber,
        customerCompany: formData.customerCompany || undefined,
        customerNotes: formData.customerNotes || undefined,
        cuisineType: skipMenu ? undefined : formData.cuisineType || undefined,
        menuName: skipMenu ? undefined : formData.menuName || undefined,
        menuType: skipMenu ? undefined : formData.menuType || undefined,
        menuSpecialInstructions: skipMenu
            ? undefined
            : formData.menuSpecialInstructions || undefined,
        amenitiesSpecialInstructions:
            formData.amenitiesSpecialInstructions || undefined,
        amenities,
        food,
        total: pricing.total,
        discount: pricing.discount,
        tax: pricing.tax,
        serviceChargePercent,
        vatPercent,
        amountPaid: options?.amountPaid ?? formData.amountPaid ?? 0,
        paymentPlan:
            options?.paymentPlan ?? formData.paymentPlan ?? undefined,
        paymentMethod:
            options?.paymentMethod ?? formData.paymentMethod ?? undefined,
        discountReason:
            options?.discountReason ?? formData.discountReason ?? undefined,
        paymentStatus: formData.paymentStatus ?? 'pending',
        bookingStatus: formData.bookingStatus ?? 'confirmed',
    };
}

/** Map API booking (amenity `amount`) to form (`cost`). */
export function mapApiBookingToForm(
    booking: Record<string, unknown>,
): Partial<BookingForm> {
    const amenities = Array.isArray(booking.amenities)
        ? booking.amenities.map((a: Record<string, unknown>) => ({
              id: Number(a.id) || 0,
              name: String(a.name ?? ''),
              available: String(a.available ?? ''),
              cost: String(a.cost ?? a.amount ?? ''),
              quantity: String(a.quantity ?? ''),
          }))
        : [];

    return {
        ...(booking as Partial<BookingForm>),
        amenities,
        food: Array.isArray(booking.food)
            ? (booking.food as BookingForm['food'])
            : [],
        cuisineType: (booking.cuisineType as string) ?? '',
        menuName: (booking.menuName as string) ?? '',
        menuType: (booking.menuType as string) ?? '',
        eventEndTime: (booking.eventEndTime as string) ?? '',
        estimatedGuestCount: (booking.estimatedGuestCount as string) ?? '',
        setupTime: (booking.setupTime as string) ?? '',
        teardownTime: (booking.teardownTime as string) ?? '',
        eventCategory: (booking.eventCategory as string) ?? '',
        eventDescription: (booking.eventDescription as string) ?? '',
        customerCompany: (booking.customerCompany as string) ?? '',
        customerNotes: (booking.customerNotes as string) ?? '',
        menuSpecialInstructions:
            (booking.menuSpecialInstructions as string) ?? '',
        amenitiesSpecialInstructions:
            (booking.amenitiesSpecialInstructions as string) ?? '',
        serviceChargePercent: Number(booking.serviceChargePercent) || 10,
        vatPercent: Number(booking.vatPercent) || 7.5,
        amountPaid: Number(booking.amountPaid) || 0,
        paymentPlan:
            (booking.paymentPlan as BookingForm['paymentPlan']) ?? null,
        paymentMethod: (booking.paymentMethod as string) ?? '',
        discountReason: (booking.discountReason as string) ?? '',
        createdAt: booking.createdAt
            ? String(booking.createdAt)
            : undefined,
        total: Number(booking.total) || 0,
        discount: Number(booking.discount) || 0,
        tax: Number(booking.tax) || 0,
        paymentStatus:
            (booking.paymentStatus as BookingForm['paymentStatus']) ??
            'pending',
        bookingStatus:
            (booking.bookingStatus as BookingForm['bookingStatus']) ??
            'confirmed',
    };
}
