'use client';

import PaymentSettlementModal, {
    type CheckoutOptions,
} from '@/components/front-office/common/Form/PaymentSettlementModal';

type GuestCheckoutBalanceModalProps = {
    guest: Record<string, unknown> | null;
    onClose: () => void;
    onCheckout: (options?: CheckoutOptions) => void | Promise<void>;
};

export function GuestCheckoutBalanceModal({
    guest,
    onClose,
    onCheckout,
}: GuestCheckoutBalanceModalProps) {
    if (!guest) return null;

    return (
        <PaymentSettlementModal
            guest={guest}
            isOpen
            onClose={onClose}
            onPaymentSuccess={() => {}}
            onCheckout={onCheckout}
        />
    );
}
