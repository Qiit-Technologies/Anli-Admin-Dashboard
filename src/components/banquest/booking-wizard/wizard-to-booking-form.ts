import { BookingForm } from '../types';
import { EVENT_CATEGORIES } from './constants';
import { BanquetWizardState, defaultWizardState } from './types';

function categoryLabel(state: BanquetWizardState): string {
    return state.eventCategory === 'Others'
        ? state.eventCategoryOther || 'Others'
        : state.eventCategory;
}

export function wizardStateToBookingForm(
    state: BanquetWizardState,
): Partial<BookingForm> {
    const customerName =
        [state.firstName, state.lastName].filter(Boolean).join(' ').trim() ||
        state.customerName;

    return {
        eventName: state.eventName,
        eventType: state.eventType,
        eventVenue: state.eventVenue,
        eventDate: state.eventDate,
        eventTime: state.eventTime,
        eventEndTime: state.eventEndTime || undefined,
        estimatedGuestCount: state.estimatedGuestCount || undefined,
        setupTime: state.setupTime || undefined,
        teardownTime: state.teardownTime || undefined,
        eventCategory: categoryLabel(state) || undefined,
        eventDescription: state.eventDescription || undefined,
        customerTitle: state.customerTitle,
        customerName,
        customerEmailAddress: state.customerEmailAddress,
        customerPhoneNumber: state.customerPhoneNumber,
        customerCompany: state.company || undefined,
        customerNotes: state.customerNotes || undefined,
        cuisineType: state.skipMenu
            ? undefined
            : state.cuisineType || undefined,
        menuName: state.skipMenu
            ? undefined
            : state.restaurantMenuName || state.menuName,
        menuType: state.skipMenu ? undefined : state.menuType,
        menuSpecialInstructions: state.skipMenu
            ? undefined
            : state.menuSpecialInstructions || undefined,
        amenitiesSpecialInstructions:
            state.amenitiesSpecialInstructions || undefined,
        amenities: state.amenities,
        food: state.skipMenu ? [] : state.food,
        total: state.total,
        discount: state.discount,
        tax: state.tax,
        serviceChargePercent: state.serviceChargePercent,
        vatPercent: state.vatPercent,
        amountPaid: state.amountPaid,
        paymentPlan: state.paymentPlan,
        paymentMethod: state.paymentMethod,
        discountReason: state.discountReason || undefined,
        paymentStatus: state.paymentStatus,
        bookingStatus: state.bookingStatus,
    };
}

export function bookingFormToWizardState(
    initial?: Partial<BookingForm>,
): BanquetWizardState {
    const base = defaultWizardState();
    if (!initial) return base;

    const nameParts = (initial.customerName ?? '').trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ');

    const predefinedCategories = new Set<string>(EVENT_CATEGORIES);
    const savedCategory = initial.eventCategory ?? '';
    let eventCategory = '';
    const eventCategoryOther = '';

    if (predefinedCategories.has(savedCategory)) {
        eventCategory = savedCategory;
    } else if (savedCategory) {
        eventCategory = savedCategory;
    }

    return {
        ...base,
        ...initial,
        firstName,
        lastName,
        customerName: initial.customerName ?? '',
        company: initial.customerCompany ?? '',
        customerNotes: initial.customerNotes ?? '',
        eventCategory,
        eventCategoryOther,
        eventDescription: initial.eventDescription ?? '',
        eventEndTime: initial.eventEndTime ?? '',
        estimatedGuestCount: initial.estimatedGuestCount ?? '',
        setupTime: initial.setupTime ?? '',
        teardownTime: initial.teardownTime ?? '',
        menuSpecialInstructions: initial.menuSpecialInstructions ?? '',
        amenitiesSpecialInstructions:
            initial.amenitiesSpecialInstructions ?? '',
        serviceChargePercent: initial.serviceChargePercent ?? 10,
        vatPercent: initial.vatPercent ?? 7.5,
        amountPaid: initial.amountPaid ?? 0,
        paymentPlan: initial.paymentPlan ?? 'full',
        paymentMethod:
            (initial.paymentMethod as BanquetWizardState['paymentMethod']) ??
            'bank',
        discountReason: initial.discountReason ?? '',
        amenities: initial.amenities ?? [],
        food: initial.food ?? [],
        skipMenu:
            !initial.cuisineType &&
            !initial.menuName &&
            !initial.menuType &&
            (!initial.food || initial.food.length === 0),
        restaurantMenuName: initial.menuName ?? '',
    };
}
