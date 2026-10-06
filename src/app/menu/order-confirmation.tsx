'use client';

import { Order } from '@/store/useOrder';
import useHotel from '@/hooks/useHotel';

const getMoney = (value: number | string | undefined | null) =>
    Number(value ?? 0);

const deriveVatRate = (order: Partial<Order>) =>
    Number(
        order.vatRate ??
            order.vatRateSnapshot ??
            (order as any)?.hotel?.restaurantVatRate ??
            (order as any)?.hotel?.vatRate ??
            0,
    );

const deriveSubtotal = (order: Partial<Order>) => {
    if (order.subtotal !== undefined && order.subtotal !== null) {
        return getMoney(order.subtotal);
    }
    return (
        order.items?.reduce(
            (total, item) => total + getMoney(item.price) * item.quantity,
            0,
        ) ?? 0
    );
};

const OrderConfirmation = ({ order }: { order: Partial<Order> }) => {
    const { organization } = useHotel();
    const restaurantVatInclusive = organization?.restaurantVatInclusive ?? false;
    const subtotal = deriveSubtotal(order);
    const vatRate = deriveVatRate(order);
    const serviceChargeRate = Number(
        order.serviceChargeRateSnapshot ??
            order.serviceChargeRate ??
            (order as any)?.hotel?.restaurantServiceChargeRate ??
            (order as any)?.hotel?.serviceChargeRate ??
            0,
    );
    const tipRate = Number(
        order.tipRateSnapshot ??
            order.tipRate ??
            (order as any)?.hotel?.restaurantTipRate ??
            (order as any)?.hotel?.tipRate ??
            0,
    );
    console.log('vatRate', vatRate);
    const vatAmount =
        order.vatAmount !== undefined && order.vatAmount !== null
            ? getMoney(order.vatAmount)
            : Number(((subtotal * vatRate) / 100).toFixed(2));
    const serviceChargeAmount =
        order.serviceChargeAmount !== undefined &&
        order.serviceChargeAmount !== null
            ? getMoney(order.serviceChargeAmount)
            : Number(((subtotal * serviceChargeRate) / 100).toFixed(2));
    const tipAmount =
        order.tipAmount !== undefined && order.tipAmount !== null
            ? getMoney(order.tipAmount)
            : Number(((subtotal * tipRate) / 100).toFixed(2));
    const totalAmount =
        order.totalAmount !== undefined && order.totalAmount !== null
            ? getMoney(order.totalAmount)
            : Number(
                  (
                      subtotal +
                      vatAmount +
                      serviceChargeAmount +
                      tipAmount
                  ).toFixed(2),
              );

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-center">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Order Confirmed!
                    </h2>
                    <p className="text-green-100">Thank you for your order</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-semibold text-gray-900">
                                    #{order.requestId}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    Order Type:
                                </span>
                                <span className="font-semibold text-gray-900 capitalize">
                                    {order.orderType
                                        ?.toLowerCase()
                                        .replace('_', ' ')}
                                </span>
                            </div>
                            <div className="space-y-2 border-t pt-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Subtotal:
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        ₦{subtotal.toFixed(2)}
                                    </span>
                                </div>
                                {!restaurantVatInclusive && vatRate > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            VAT ({vatRate.toFixed(2)}%):
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ₦{vatAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {serviceChargeRate > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Service Charge (
                                            {serviceChargeRate.toFixed(2)}%):
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ₦{serviceChargeAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {tipRate > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            Tip ({tipRate.toFixed(2)}%):
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            ₦{tipAmount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">
                                        Total Amount:
                                    </span>
                                    <span className="font-bold text-2xl text-green-600">
                                        ₦{totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                            Items Ordered:
                        </h3>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-100"
                                >
                                    <div>
                                        <span className="font-medium text-gray-900">
                                            {item.name}
                                        </span>
                                        {item.quantity > 1 && (
                                            <span className="text-sm text-gray-500 ml-2">
                                                x{item.quantity}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-semibold text-gray-900">
                                        ₦{item.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg
                                    className="w-4 h-4 text-blue-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <p className="text-blue-800 text-sm">
                                Your order is being prepared. You&apos;ll be
                                notified when it&apos;s ready.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
