import { PurchaseOrderStage } from '@/types/purchase-order';
import { Vendor } from '@/types/vendor';

interface OrderItem {
    id: number;
    price: number | null;
    quantity: number;
    notes?: string | null;
    isReady?: boolean;
    isNewlyAdded?: boolean;
    isComplimentary?: boolean;
    originalPrice?: number | string | null;
    lastPrintedAt?: string | null;
    previousQuantity?: number;
    menuItem?: {
        id: number;
        name: string;
        price: string;
        description: string;
        isAvailable: boolean;
        imageUrl: string;
        createdAt: string;
        updatedAt: string;
        category?: {
            id: number;
            category: string;
            name: string;
        };
    };
}

interface Room {
    id: number;
    status: 'DIRTY' | 'CLEAN';
    price: string;
    floor: number;
    roomNumber: string;
    createdAt: string;
    roomCapacity: number;
    coverImage: string | null;
    isOccupied: boolean;
    isBooked: boolean;
}

// interface Hotel {
//     id: number;
//     name: string;
//     isActive: boolean;
//     address: string;
//     businessType: 'HOTEL';
//     registrationNumber: string;
//     country: string;
//     state: string;
//     coverImage: string | null;
//     cacImage: string;
//     isCacVerified: boolean;
//     isEmailVerified: boolean;
//     createdAt: string;
//     taxId: string | null;
//     incorporationCert: string | null;
//     boardingToken: string;
//     services: string;
// }

interface User {
    id: number;
    username: string;
    fullName: string;
    password: string;
    email: string;
    profileImage: string | null;
    createdAt: string;
    roleId?: number;
}

interface Table {
    id: number;
    number: number;
    isOccupied: boolean;
    numberOfSeats: number;
    availableSeats: number;
    dineInArea: string;
    current_waiter: User | null;
    kitchen?: number;
}

export interface ScopedOrder {
    id: number;
    requestId?: string;
    guestName: string;
    guestEmail: string;
    guestPhoneNumber: string;
    deliveryAddress: string | null;
    remark: string | null;
    scheduledFor: string | null;
    orderType:
        | 'DINE_IN'
        | 'ROOM'
        | 'NO_CHARGE'
        | 'TAKE_AWAY'
        | 'DELIVERY'
        | 'FAST_FOOD';
    status:
        | 'PENDING'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'IN_KITCHEN'
        | 'DISPATCHED'
        | 'READY'
        | 'VOIDED';
    paymentStatus:
        | 'PAID'
        | 'PENDING'
        | 'FAILED'
        | 'COMPLEMENTED'
        | 'ADDED_TO_BILL'
        | 'BILL_SETTLED_FROM_FRONT_DESK'
        | 'VOIDED';
    paymentMethod: string | null;
    receivingAccount: string | null;
    createdAt: string;
    completedAt: string | null;
    updatedAt: string | null;
    isCancelled: boolean;
    isVoided?: boolean;
    voidReason?: string | null;
    isComplimented?: boolean;
    complimentaryStatus?: 'NONE' | 'FULL' | 'PARTIAL';
    complimentaryAmount?: number | string;
    remainingBalance?: number | string;
    complimentReason?: string | null;
    pinOverrideUsed?: boolean;
    complimentaryApprovedAt?: string | null;
    complimentaryApprovedBy?: User | null;
    waivedCharges?: {
        vat?: boolean;
        serviceCharge?: boolean;
        tip?: boolean;
        customCharges?: boolean;
        waivedByName?: string | null;
    } | null;
    waivedAmount?: number;
    waivedBy?: number | null;
    waivedAt?: string | null;
    waiverReason?: string | null;
    settledAt?: string | null;
    settledById?: number | null;
    settlementReference?: string | null;
    totalPrice: string | number;
    subtotal?: string | number;
    vatAmount?: string | number;
    vatRateSnapshot?: string | number;
    vatRate?: string | number;
    serviceChargeAmount?: number;
    serviceChargeRateSnapshot?: number;
    serviceChargeRate?: number;
    tipAmount?: number;
    tipRateSnapshot?: number;
    tipRate?: number;
    customCharges?: Array<{
        id: number;
        name: string;
        rate: number;
        amount: number;
    }> | null;
    totalCustomChargesAmount?: number;
    totalWithCustomCharges?: number;
    isDiscounted?: boolean;
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;
    discountValue?: number | string | null;
    discountAmount?: number | string | null;
    discountReason?: string | null;
    address: string;
    table: Table | null;
    dineInArea?: { id: number; name: string } | null;
    room: Room;
    items: OrderItem[];
    waiter: User;
    createdBy: User;
    hotel?: {
        vatRate?: number | string;
        serviceChargeRate?: number;
        tipRate?: number;
    };
    payments?: {
        id: number;
        paymentMethod: string | null;
        amount: number;
        transactionReference: string | null;
        receivingAccount: string | null;
        hotelId: number;
        createdAt: string;
    }[];
}

export interface ScopedCompliment {
    orderId: string;
    orderType: string;
    itemName: string;
    amount: string;
    waiter: string;
    date: Date;
    approvedBy: string;
    reason: string;
}

export interface ScopedPayroll {
    id: string;
    referenceId: string;
    payrollRef: string;
    period: string;
    numberOfStaff: number;
    totalAmount: number;
    paymentStatus: 'pending' | 'paid' | 'failed';
    transactionTime: string;
    transactionType: string;
    amount: string;
    date: string;
    time: string;
    module: string;
    status: any;
}

export interface ScopedEmployeePayroll {
    id: string;
    employeeImage: string;
    employeeName: string;
    jobTitle: string;
    basePay: string;
    deductions: string;
    netPay: string;
    status: string;
    paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface ScopedAccount {
    id: number;
    accountType: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    balance: string;
    status: 'Deactivate' | 'Activate';
    isActive: boolean;
    department?: { id: string; name: string };
    module: string;
    description: string;
    isPayroll: boolean;
    createdAt: string;
}

export interface ScopedPurchase {
    poNumber: string;
    vendor: Vendor;
    total: string;
    itemGrouping: string;
    dateSent: string;
    status: 'awaiting_grn' | 'pending_payment' | 'completed' | 'pending';
    items?: ScopedPurchaseOrder[];
    currentStage?: PurchaseOrderStage | any;
}

export interface ScopedTransaction {
    id: number;
    transactionType: string;
    quantityChange: number;
    transactionDate: string;
    role: {
        department: string;
    };
    staff: {
        fullName: string;
    };
    item: {
        name: string;
    };
    order: ScopedOrder;
    department: string;
    description: string;
    account: string;
    status: 'Completed' | 'Pending';
    orderId: string;
    tableRoom: string;
    paymentType: string;
    servedBy: string;
}

export interface ScopedPurchaseOrder {
    quantity: number;
    item: string;
    amount: string;
}

export interface ScopedTotalExpenses {
    expenseType: string;
    amount: string;
    isNegative: boolean;
}

export interface ScopedCompletedTnx {
    transactionID: string;
    department: string;
    description: string;
    paymentMethod: string;
    amount: string;
    date: string;
    status: 'Completed' | 'Pending';
}

export interface ScopedOutStandingPayment {
    referenceNo: string;
    type: string;
    department: string;
    customerVendor: string;
    amount: string;
    date: string;
    status: 'Overdue' | 'Pending';
}

export interface ScopedStockUsage {
    itemName: string;
    departmentUsed: string;
    quantityIssued: string;
    unitCost: string;
    totalCost: string;
}

export interface ScopedStockMovement {
    itemName: string;
    qtyIssued: string;
    date: string;
    department: string;
    status: string;
    receivedBy: string;
    approvedBy: string;
}

export interface ScopedremainingStock {
    itemName: string;
    description: string;
    currentQty: string;
    unit: string;
}

export interface ScopedStockByStaff {
    itemName: string;
    action: string;
    currentQty: string;
    date: string;
    department: string;
    staffName: string;
}

export interface ScopedStockAdditions {
    itemName: string;
    openingQty: string;
    qtyAdded: string;
    date: string;
    addedBy: string;
}

export interface ScopedDepartmentalSales {
    orderID: string;
    tableRoom: string;
    itemsSold: string;
    amount: string;
    paymentMethod: string;
    date: string;
    servedBy: string;
}
