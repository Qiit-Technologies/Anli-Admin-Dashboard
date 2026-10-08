type RoomType = {
    id: number;
    createdAt: string;
    name: string;
    description: string;
};

type Room = {
    id: number;
    status: 'BOOKED' | 'AVAILABLE' | 'OCCUPIED';
    price: string;
    floor: number;
    roomNumber: number;
    createdAt: string;
    roomCapacity: number;
    coverImage: string;
    isDirty: boolean;
    isOccupied: boolean;
    isBooked: boolean;
    roomNumberRoman: string;
};

export type Reservation = {
    id: number;
    fullName: string;
    email: string;
    address: string | null;
    createdAt: string;
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    phoneNumber: number;
    property: string | null;
    startTime: string | null;
    endTime: string | null;
    startDate: string;
    endDate: string;
    numberOfGuests: number;
    secondGuestFullName: string | null;
    secondGuestPhoneNumber: number | null;
    secondGuestType: 'adult' | 'child' | 'infant';
    paymentMethod:
        | 'cash'
        | 'debit'
        | 'credit'
        | 'transfer'
        | 'pos'
        | 'internal_account'
        | string;
    receivingAccount?: string | null;
    /** Immutable IA settlement snapshot (preferred over paymentMethod when present) */
    settlementPaymentMethod?: string | null;
    settlementReceivingAccount?: string | null;
    amountPaid: number;
    outstanding: number;
    totalDue?: number; // Calculated field: outstanding + unpaid services + unpaid orders
    paidAmount?: number; // Comprehensive paid amount: room charges + paid services + paid orders
    orderCount?: number;
    serviceCount?: number;
    extrasTotal?: number;
    extrasPaid?: number;
    extrasDue?: number;
    extrasLabels?: string[];
    paidActivityCount?: number;
    unpaidActivityCount?: number;
    hasRoomActivity?: boolean;
    receivableBalance?: number; // Receivable balance for this stay/reservation
    payableBalance?: number | null; // Payable balance (credit balance) for this stay/reservation if guest has credit
    totalCost?: number;
    originalPrice?: number;
    discountAmount?: number;
    finalPrice?: number;
    vatAmount?: number;
    totalWithVat?: number;
    serviceChargeAmount?: number;
    totalWithServiceCharge?: number;
    tipAmount?: number;
    totalWithTip?: number;
    totalCustomChargesAmount?: number;
    totalWithCustomCharges?: number;
    roomNumber: number;
    status: 'GOOD' | 'BAD' | 'PENDING' | 'CANCELLED';
    checkOutNote: string | null;
    deletedAt: string | null;
    roomType: RoomType;
    room: Room;
    isComplimentary?: boolean;
    isDiscounted?: boolean;
    isVoid?: boolean;
    voidReason?: string;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue?: number;
    discountReason?: string;
    needsApproval: boolean;
    isApproved?: boolean;
    approvedBy?: number;
    approvedAt?: Date;
    approvalType?: 'COMPLIMENTARY' | 'DISCOUNT' | 'VOID';
    voidedBy: number;
    voidedAt: Date;
    isRejected?: boolean;
    rejectedBy?: number;
    rejectedAt?: Date;
    rejectionReason?: string;
    approvalReason?: string;
    complimentaryRequestedBy: number;
    complimentaryRequestedAt: Date;
    discountRequestedBy: number;
    discountRequestedAt: Date;
    IDNumber?: string;
    IDImage?: string;
    proofOfPayment?: string;
    isProofOfPaymentApproved?: boolean;
    balance?: number;
    rebateRate?: number | string | null;
    rebateEffectiveDate?: string | null;
    rebateComment?: string | null;
    rebateAppliedAt?: string | null;
    groupReservationId?: number | null;
    groupReservationCode?: string | null;
    waivedCharges?: {
        vat: boolean;
        serviceCharge: boolean;
        tip: boolean;
        customCharges: boolean;
        originalVatAmount?: number;
        originalServiceChargeAmount?: number;
        originalTipAmount?: number;
        originalCustomChargesAmount?: number;
    } | null;
    waivedAmount?: number;
    waivedBy?: number;
    waivedAt?: string | Date;
    waiverReason?: string;
};
