import { CreateBanquetMenuPackageInput } from '@/app/actions/banquet-menu-package';
import { getMenuItems } from '@/app/actions/menu-item';
import { MenuPackageWizardState } from '../package-wizard/types';

function inferCategory(eventSuitable: string): string {
    const t = eventSuitable.toLowerCase();
    if (t.includes('wedding')) return 'wedding';
    if (t.includes('corporate') || t.includes('conference')) return 'corporate';
    if (t.includes('social')) return 'social';
    if (t.includes('local')) return 'local';
    return 'other';
}

function parseNum(value: string, fallback = 0): number {
    const n = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) ? n : fallback;
}

export async function wizardStateToMenuPackagePayload(
    state: MenuPackageWizardState,
): Promise<CreateBanquetMenuPackageInput> {
    const itemsResult = await getMenuItems();
    const rawItems = Array.isArray(itemsResult?.data) ? itemsResult.data : [];
    const itemMap = new Map(
        (
            rawItems as {
                id: number;
                name: string;
                description?: string;
                price?: number;
            }[]
        ).map((i) => [i.id, i]),
    );

    const selectedItems = state.selectedMenuItemIds
        .map((id) => {
            const item = itemMap.get(id);
            if (!item) return null;
            return {
                menuItemId: id,
                menuItemName: item.name,
                menuItemDescription: item.description,
                quantity: 1,
                unitPrice: Number(item.price) || parseNum(state.pricePerGuest),
            };
        })
        .filter(Boolean) as CreateBanquetMenuPackageInput['items'];

    const priceMin = parseNum(state.priceMin || state.pricePerGuest);
    const priceMax = parseNum(state.priceMax || state.pricePerGuest, priceMin);

    return {
        name: state.packageName.trim(),
        description: state.eventDescription.trim() || undefined,
        category: inferCategory(state.eventSuitable),
        mealType: state.mealType || state.serviceStyleDropdown || 'Buffet',
        serviceStyle: state.serviceStyle || state.serviceStyleDropdown,
        guestMin: parseNum(state.guestMin || state.minGuestCount) || undefined,
        guestMax: parseNum(state.guestMax || state.maxGuestCount) || undefined,
        pricePerGuest: parseNum(state.pricePerGuest),
        priceMin,
        priceMax: Math.max(priceMin, priceMax),
        serviceChargePercent: state.serviceChargeEnabled
            ? parseNum(state.serviceChargePercent, 10)
            : 0,
        vatPercent: state.vatEnabled ? parseNum(state.vatPercent, 7.5) : 0,
        serviceChargeEnabled: state.serviceChargeEnabled,
        vatEnabled: state.vatEnabled,
        kidMenuEnabled: state.kidMenuEnabled,
        eventSuitable: state.eventSuitable,
        specialAddOns: state.specialAddOns,
        portionConfig: {
            portionSize: state.portionSize,
            proteinQuantity: state.proteinQuantity,
            ricePortion: state.ricePortion,
            soupServing: state.soupServing,
            saladServing: state.saladServing,
            dessertPortion: state.dessertPortion,
        },
        imageUrl: state.imageFileName || undefined,
        items: selectedItems,
    };
}
