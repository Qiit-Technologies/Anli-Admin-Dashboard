import { CreateBanquetRentalInput } from '@/app/actions/banquet-rental';
import { RentWizardState } from '../rent-wizard/types';

function parseDurationDays(duration: string): number {
    const n = Number(duration.replace(/\D/g, ''));
    return Number.isFinite(n) && n > 0 ? n : 1;
}

export function wizardStateToRentalPayload(
    state: RentWizardState,
): CreateBanquetRentalInput {
    const selections = state.selections.filter((s) => s.quantity > 0);
    const durationDays = parseDurationDays(state.duration || '1');

    const subtotal = selections.reduce(
        (sum, s) => sum + s.unitPrice * s.quantity * durationDays,
        0,
    );
    const serviceCharge = subtotal * 0.05;
    const vat = subtotal * 0.075;

    return {
        eventType: state.eventType?.trim() || 'Rental',
        startDate: state.startDate || undefined,
        endDate: state.endDate || undefined,
        duration: state.duration || `${durationDays} days`,
        deliveryOption: state.deliveryOption,
        pickupDate: state.pickupDate || undefined,
        pickupTime: state.pickupTime || undefined,
        returnDate: state.returnDate || undefined,
        returnTime: state.returnTime || undefined,
        contactName: state.contactName || undefined,
        contactPhone: state.contactPhone || undefined,
        contactEmail: state.contactEmail || undefined,
        subtotal,
        serviceCharge,
        vat,
        amountPaid: subtotal + serviceCharge + vat,
        items: selections.map((s) => ({
            inventoryItemId: Number(s.id),
            quantity: s.quantity,
            unitPrice: s.unitPrice,
        })),
    };
}
