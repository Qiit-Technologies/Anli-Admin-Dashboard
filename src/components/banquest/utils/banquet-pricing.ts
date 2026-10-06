import { Amenities, Food } from '../types';

export interface BanquetPricingBreakdown {
    amenitiesSubtotal: number;
    foodSubtotal: number;
    subtotal: number;
    serviceCharge: number;
    vat: number;
    discount: number;
    tax: number;
    total: number;
}

export interface BanquetPricingOptions {
    discount?: number;
    /** Flat tax amount (legacy). Ignored when serviceChargePercent / vatPercent are set. */
    tax?: number;
    serviceChargePercent?: number;
    vatPercent?: number;
}

export function lineTotal(
    cost: string | number,
    quantity: string | number,
): number {
    const unit = Number(cost) || 0;
    const qty = Number(quantity) || 0;
    return unit * qty;
}

export function calculateAmenitiesSubtotal(
    amenities: Amenities[] = [],
): number {
    return amenities.reduce(
        (sum, item) => sum + lineTotal(item.cost, item.quantity),
        0,
    );
}

export function calculateFoodSubtotal(food: Food[] = []): number {
    return food.reduce(
        (sum, item) => sum + lineTotal(item.cost, item.quantity),
        0,
    );
}

export function calculateBanquetPricing(
    amenities: Amenities[] = [],
    food: Food[] = [],
    discount = 0,
    taxOrOptions: number | BanquetPricingOptions = 0,
    legacyTax?: number,
): BanquetPricingBreakdown {
    const options: BanquetPricingOptions =
        typeof taxOrOptions === 'object'
            ? taxOrOptions
            : { tax: legacyTax ?? taxOrOptions };

    const amenitiesSubtotal = calculateAmenitiesSubtotal(amenities);
    const foodSubtotal = calculateFoodSubtotal(food);
    const subtotal = amenitiesSubtotal + foodSubtotal;
    const safeDiscount = Math.min(Math.max(0, discount), subtotal);
    const afterDiscount = subtotal - safeDiscount;

    const serviceChargePercent = options.serviceChargePercent ?? 0;
    const vatPercent = options.vatPercent ?? 0;
    const usePercentFees =
        serviceChargePercent > 0 || vatPercent > 0;

    const serviceCharge = usePercentFees
        ? (afterDiscount * serviceChargePercent) / 100
        : 0;
    const vat = usePercentFees
        ? ((afterDiscount + serviceCharge) * vatPercent) / 100
        : 0;
    const safeTax = usePercentFees
        ? serviceCharge + vat
        : Math.max(0, options.tax ?? 0);
    const total = afterDiscount + safeTax;

    return {
        amenitiesSubtotal,
        foodSubtotal,
        subtotal,
        serviceCharge,
        vat,
        discount: safeDiscount,
        tax: safeTax,
        total,
    };
}

export function formatMoney(amount: number, currency = '₦'): string {
    return `${currency}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}
