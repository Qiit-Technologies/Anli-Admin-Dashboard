export type BookingModalProps = {
    onClose: () => void;
    open: boolean;
};

export type BookingDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    booking: any;
};
