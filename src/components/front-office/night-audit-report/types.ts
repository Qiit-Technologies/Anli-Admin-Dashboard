export interface ManagerFlashSection {
    auditDate: string;
    auditStatus: 'completed' | 'pending' | 'failed';
    totalRooms: number;
    roomsSold: number;
    roomsAvailable: number;
    occupancyPct: number;
    adr: number;
    revpar: number;
    projectedOccupancyPct?: number;
    projectedAdr?: number;
    roomRevenue: number;
    totalHotelRevenue: number;
    paymentsReceived: number;
    outstandingBalances: number;
    totalReceivables: number;
    totalPayables: number;
    exceptions: Array<{
        type: string;
        count: number;
        severity: 'info' | 'warning' | 'critical';
    }>;
}

export interface FrontOfficeSection {
    arrivals: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        departureDate: string;
        pax: number;
        source: string;
        bookingCode: string;
        isWalkIn: boolean;
        isGroup: boolean;
        isVip: boolean;
        status: string;
    }>;
    departures: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        departureDate: string;
        nights: number;
        pax: number;
        bookingCode: string;
        hasOutstanding: boolean;
        earlyCheckout: boolean;
    }>;
    stayovers: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        departureDate: string;
        nights: number;
        pax: number;
        bookingCode: string;
        isComplimentary: boolean;
        isHouseUse: boolean;
        balance: number;
    }>;
    noShows: Array<{
        guestName: string;
        room?: string;
        bookingCode: string;
        arrivalDate: string;
        source: string;
    }>;
    cancellations: Array<{
        guestName: string;
        room?: string;
        bookingCode: string;
        arrivalDate: string;
        reason?: string;
        cancelledAt: string;
    }>;
    walkIns: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        pax: number;
        source: string;
    }>;
    complimentaryRooms: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        departureDate: string;
        reason?: string;
        approvedBy?: string;
    }>;
    houseUseRooms: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        departureDate: string;
        department?: string;
    }>;
    roomStatus: Array<{
        roomNumber: string;
        roomType: string;
        status: string;
        isOccupied: boolean;
        isDirty: boolean;
        housekeepingStatus?: string;
        discrepancy?: string;
    }>;
    roomDiscrepancies: Array<{
        roomNumber: string;
        roomType: string;
        frontOfficeStatus: string;
        housekeepingStatus: string;
        discrepancy: string;
    }>;
    roomRevenue: Array<{
        room: string;
        nights: number;
        rate: number;
        amount: number;
        paymentMode: string;
        status: string;
    }>;
    guestTransactions: Array<{
        guestName: string;
        room: string;
        transactionType: string;
        amount: number;
        paymentMode: string;
        status: string;
        createdAt: string;
    }>;
}

export interface GuestFinancialPositionSection {
    complimentaryStays: Array<{
        guestName: string;
        room: string;
        arrivalDate: string;
        departureDate: string;
        originalAmount: number;
        waivedAmount: number;
        reason?: string;
    }>;
    paidAmounts: Array<{
        guestName: string;
        room: string;
        totalPaid: number;
        paymentMethods: Record<string, number>;
    }>;
    outstandingBalances: Array<{
        guestName: string;
        room: string;
        bookingCode: string;
        balance: number;
        daysOutstanding: number;
    }>;
    guestReceivables: Array<{
        guestName: string;
        profileId: number;
        balance: number;
        description?: string;
        referenceNumber?: string;
    }>;
    guestPayables: Array<{
        guestName: string;
        profileId: number;
        balance: number;
        description?: string;
        referenceNumber?: string;
    }>;
    depositsAdvancePayments: Array<{
        guestName: string;
        room: string;
        amount: number;
        type: 'deposit' | 'advance';
        receivedAt: string;
    }>;
    totalReceivables: number;
    totalPayables: number;
}

export interface AccountPaymentSection {
    accounts: Array<{
        accountName: string;
        accountType: string;
        totalReceived: number;
        totalTransferred: number;
        transactionCount: number;
        transactions: Array<{
            id: number;
            type: 'guest_payment' | 'order_payment' | 'transfer';
            source: string;
            amount: number;
            paymentMethod: string;
            reference?: string;
            createdAt: string;
        }>;
    }>;
    totalReceived: number;
    totalTransferred: number;
}

export interface PaymentReconciliationSection {
    methods: Array<{
        method: string;
        expected: number;
        actual: number;
        variance: number;
        variancePct: number;
        status: 'balanced' | 'over' | 'short';
    }>;
    totalExpected: number;
    totalActual: number;
    totalVariance: number;
    hasDiscrepancy: boolean;
}

export interface RevenueSection {
    centres: Array<{
        centre: string;
        grossRevenue: number;
        discounts: number;
        voids: number;
        taxes: number;
        serviceCharges: number;
        netRevenue: number;
        transactionCount: number;
    }>;
    totalGrossRevenue: number;
    totalDiscounts: number;
    totalVoids: number;
    totalTaxes: number;
    totalServiceCharges: number;
    totalNetRevenue: number;
}

export interface FbAuditSection {
    guestRoomTransactions: Array<{
        orderId: number;
        requestId?: string;
        guestName: string;
        room: string;
        orderType: string;
        amount: number;
        paymentStatus: string;
        paidAmount: number;
        outstandingAmount: number;
        createdAt: string;
        paymentMethod?: string;
    }>;
    dailySales: {
        totalOrders: number;
        grossSales: number;
        complimentaryOrders: number;
        complimentaryTotal: number;
        expectedRevenue: number;
        actualRevenue: number;
        pendingUnpaidAmount: number;
        totalReceivable: number;
        totalPayable: number;
    };
    workPeriods: Array<{
        id: number;
        area: string;
        startTime: string;
        endTime?: string;
        status: string;
        duration?: string;
    }>;
    reconciliation: {
        posTotal: number;
        pmsTotal: number;
        variance: number;
        hasDiscrepancy: boolean;
    };
}

export interface DiscountVoidAdjustmentSection {
    discounts: Array<{
        guestName: string;
        room: string;
        amount: number;
        type: string;
        reason?: string;
        requestedBy?: string;
        approvedBy?: string;
        createdAt: string;
    }>;
    voids: Array<{
        guestName: string;
        room?: string;
        bookingCode: string;
        reason?: string;
        voidedBy?: string;
        voidedAt: string;
    }>;
    adjustments: Array<{
        guestName: string;
        room: string;
        type: string;
        amount: number;
        reason: string;
        performedBy: string;
        performedAt: string;
        approvedBy?: string;
    }>;
    totalDiscounts: number;
    totalVoids: number;
    totalAdjustments: number;
}

export interface ReceivablesPayablesSection {
    receivables: Array<{
        guestName: string;
        profileId: number;
        balance: number;
        description?: string;
        referenceNumber?: string;
        createdAt: string;
    }>;
    payables: Array<{
        guestName: string;
        profileId: number;
        balance: number;
        description?: string;
        referenceNumber?: string;
        createdAt: string;
    }>;
    totalReceivables: number;
    totalPayables: number;
    netPosition: number;
}

export interface ReservationsExceptionsSection {
    pendingReservations: Array<{
        guestName: string;
        roomType: string;
        arrivalDate: string;
        departureDate: string;
        bookingCode: string;
        source: string;
        unpaidDeposit: number;
    }>;
    unassignedRooms: Array<{
        roomNumber: string;
        roomType: string;
        status: string;
    }>;
    unpaidDeposits: Array<{
        guestName: string;
        bookingCode: string;
        depositRequired: number;
        depositPaid: number;
        balance: number;
    }>;
    outstandingBalances: Array<{
        guestName: string;
        room: string;
        bookingCode: string;
        balance: number;
        dueDate?: string;
    }>;
    totalPendingReservations: number;
    totalUnassignedRooms: number;
    totalUnpaidDeposits: number;
    totalOutstandingBalances: number;
}

export interface RoomReconciliationSection {
    discrepancies: Array<{
        roomNumber: string;
        roomType: string;
        frontOfficeStatus: string;
        housekeepingStatus: string;
        isOccupied?: boolean;
        isDirty?: boolean;
        discrepancy: string;
        notes?: string;
    }>;
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    dirtyRooms: number;
    cleanRooms: number;
    oooRooms: number;
    oosRooms: number;
    discrepancyCount: number;
}

export interface TomorrowOutlookSection {
    date: string;
    arrivals: Array<{
        guestName: string;
        room: string;
        pax: number;
        source: string;
        bookingCode: string;
        isVip: boolean;
        isGroup: boolean;
    }>;
    departures: Array<{
        guestName: string;
        room: string;
        pax: number;
        bookingCode: string;
        hasOutstanding: boolean;
    }>;
    projectedOccupancyPct: number;
    totalArrivals: number;
    totalDepartures: number;
    vipArrivals: number;
    groupArrivals: number;
    roomsReadyForArrival: number;
}

export interface StructuredNightAuditReport {
    auditDate: string;
    auditStatus: 'completed' | 'pending' | 'failed';
    hasUnresolvedExceptions: boolean;
    generatedAt: string;
    generatedBy: string;
    hotelName: string;
    managerFlash: ManagerFlashSection;
    frontOffice: FrontOfficeSection;
    guestFinancialPosition: GuestFinancialPositionSection;
    accountPayments: AccountPaymentSection;
    paymentReconciliation: PaymentReconciliationSection;
    revenue: RevenueSection;
    fbAudit: FbAuditSection;
    discountsVoidsAdjustments: DiscountVoidAdjustmentSection;
    receivablesPayables: ReceivablesPayablesSection;
    reservationsExceptions: ReservationsExceptionsSection;
    roomReconciliation: RoomReconciliationSection;
    tomorrowOutlook: TomorrowOutlookSection;
}

export interface StayingOverGuest {
    room: string;
    guestName: string;
    mobile: string;
    arrivalDate: string;
    departureDate: string;
    noNights: number;
    pax: string;
    resNo: string;
    source: string;
    folioNo: string;
    total: number;
    paid: number;
    balance: number;
}

export interface DepartingGuest {
    room: string;
    guestName: string;
    arrivalDate: string;
    departureDate: string;
    noNights: number;
    pax: string;
    resNo: string;
    source: string;
}

export interface RoomRevenue {
    room: string;
    noNights: number;
    rate: number;
    amount: number;
    paymentMode: string;
    status: string;
}

export interface FoodBeverageCharge {
    source: string;
    item: string;
    quantity: number;
    amount: number;
    paymentMode: string;
    paid: string;
}

export interface RoomService {
    room: string;
    service: string;
    quantity: number;
    amount: number;
    paymentMode: string;
    paid: string;
}

export interface PaymentSummaryItem {
    paymentMethod: string;
    amount: number;
}

export interface DiscountVoidItem {
    type: string;
    count: number;
    amount: number;
}

export interface RevenueSummaryItem {
    description: string;
    amount: number;
}

export interface OutstandingCreditItem {
    description: string;
    value: string | number;
}

export interface NightAuditStats {
    totalRoomsInProperty: number;
    roomsSold: number;
    roomsAvailableToday: number;
    complimentaryHouseUse: number;
    earlyCheckouts: number;
    noShows: number;
    complimentaryHouseUse2: number;
    occupancy: string;
}

export interface NightAuditReportData {
    structuredReport?: StructuredNightAuditReport;
    stats: NightAuditStats;
    stayingOverGuests: StayingOverGuest[];
    departingGuests: DepartingGuest[];
    roomRevenue: RoomRevenue[];
    foodBeverageCharges: FoodBeverageCharge[];
    roomServices: RoomService[];
    paymentSummary: PaymentSummaryItem[];
    discountsVoids: DiscountVoidItem[];
    revenueSummary: RevenueSummaryItem[];
    outstandingCredits: OutstandingCreditItem[];
    generatedAt: string;
    generatedBy: string;
}
