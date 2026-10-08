export type NestedPartial<T> = Partial<T> & {
    [K in keyof T]?: T[K] extends object ? NestedPartial<T[K]> : T[K];
};

export type Meta = {
    total: number;
    page: number;
    lastPage: number;
};

export interface SortDescriptor<T> {
    column: keyof T | string;
    direction: 'ascending' | 'descending';
}

export interface changesInterface {
    quantity: number;
    itemId: number;
}

export interface Item {
    id: number;
    itemName: string;
    unitOfMeasurement: string;
    quantity: number;
    department?: string;
    unitPrice: number | string;
    total: number | string;
    minStock?: number;
    itemNumber?: string;
    category?: string;
    itemLocation?: string;
    outerUnitOfMeasure?: string | null;
    qtyInStockOuter?: number;
    conversionRate?: number;
    baseUnit?: string;
    qtyInStockBase?: number;
    costPerOuter?: number;
    costPerBase?: number;
    inventoryValue?: number;
    reorderQuantity?: number;
    stockDate?: string | Date | null;
    expiryDate?: string | Date | null;
    vendor?: string;
    vendorContactInfo?: string;
    status?: string;
    currentStock?: number;
}

export interface ItemProps {
    name: string;
    description: string;
    price: string;
    minStock: string;
    quantity: string;
    unitOfMeasurement: string;
}

export interface ItemInterface extends Item {
    id: number;
    createdAt: string;
    meta?: any;
    image?: any;
    inUse: number;
}

export interface ItemsReponse {
    data: ItemInterface[];
    meta: Meta;
}

export interface ItemsStats {
    itemsLowStock: number;
    itemsInStock: number;
    itemsOverStock: number;
    itemsOutOfStock: number;
}

export type InventoryResponse = {
    data: InventoryInterface[];
    meta: Meta;
};

export interface InventoryInterface {
    id: number;
    quantity: number;
    minStock: number;
    item: ItemInterface;
    role: DepartmentInterface;
}
export interface DepartmentInterface {
    department: 'management' | 'frontOffice';
}

export interface PartialInventoryInterface
    extends Partial<Omit<InventoryInterface, 'item' | 'role'>> {
    item?: Partial<ItemInterface>;
    role?: Partial<DepartmentInterface>;
}

export type ColumnKeyType =
    | 'id'
    | 'name'
    | 'department'
    | 'quantity'
    | 'minStock'
    | 'inUse'
    | 'price'
    | 'actions';

export interface GuestProps {
    guest: {
        id: number;
        fullName: string;
        country: string;
        bookingMethod: string;
        phoneNumber: number;
        email: string;
        startDate: number;
        endDate: number;
        startTime: string;
        endTime: string;
        roomNumber: number;
        numberOfGuests: number;
        amountPaid: number;
        outstanding: number;
        statuses: [];
    };
}

export interface StaffType {
    id: number;
    fullName: string;
}

interface RoomType {
    id: number;
    name: string;
    description: string;
}

export interface ROOM {
    id: number;
    status: 'BOOKED' | 'AVAIL' | 'MAINTENANCE' | 'DIRTY' | 'IN_REVIEW';
    price: string;
    floor: number;
    roomNumber: number;
    createdAt: string;
    roomCapacity: number;
    coverImage: string | null;
    isOccupied: boolean;
    isBooked: boolean;
    isDirty: boolean;
    roomtype: RoomType;
    roomNumberRoman?: string;
    guests: any[];
    maintenanceHistory?: IMaintenance[];
}

/**
 * Cleaning Request Types
 */

type Status = 'INPROGRESS' | 'COMPLETED' | 'PENDING';
type Urgency = 'NORMAL' | 'HIGH' | 'LOW';
type BusinessType = 'HOTEL' | 'OTHER';
//type RoomStatus = 'BOOKED' | 'AVAIL' | 'OCCUPIED';

interface Hotel {
    id: number;
    name: string;
    isActive: boolean;
    address: string;
    businessType: BusinessType;
    registrationNumber: string;
    country: string;
    state: string;
    createdAt: string;
    taxId: string;
    incorporationCert: string;
    boardingToken: string | null;
    services: string;
    // Checkout & Overstay Policy
    defaultCheckoutTime?: string;
    overstayThresholdMinutes?: number;
    overstayEnabled?: boolean;
    overstayFeeType?: 'FIXED' | 'PERCENTAGE';
    overstayFeeAmount?: number;
}

interface Room {
    id: number;
    status: 'BOOKED' | 'AVAIL' | 'MAINTENANCE' | 'DIRTY';
    price: string;
    floor: number;
    roomNumber: number;
    createdAt: string;
    roomCapacity: number;
    coverImage: string | null;
    isOccupied: boolean;
    isBooked: boolean;
    isDirty: boolean;
    roomtype: RoomType;
}

interface User {
    id: number;
    username: string;
    fullName: string;
    password: string;
    email: string;
    profileImage: string | null;
    createdAt: string;
}

export interface CleaningRequestType {
    id: number;
    status: Status;
    urgency: Urgency;
    roomCondition: string;
    createdAt: string;
    hotel: Hotel;
    room: Room;
    assignedTo: User;
    requestedBy: User;
}

// Maintainance Types
export enum MaintenanceStatusEnum {
    INPROGRESS = 'INPROGRESS',
    COMPLETED = 'COMPLETED',
}

export enum UrgencyStatusEnum {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export interface IMaintenance {
    id: number;
    status: MaintenanceStatusEnum;
    urgency: UrgencyStatusEnum;
    description: string;
    issueType: string;
    room: Room;
    hotel: Hotel;
    createdAt: Date;
    maintenanceDurationValue?: number | null;
    maintenanceDurationUnit?: 'MINUTES' | 'HOURS' | 'DAYS' | null;
    expectedResolutionAt?: string | null;
    completedAt?: string | null;
    reportedBy: User;
    roomtype: string;
}

// Lost Item Types
export enum LostItemStatusEnum {
    UNCLAIMED = 'UNCLAIMED',
    CLAIMED = 'CLAIMED',
}

export interface ILostItem {
    id: number;
    name: string;
    guestContacted: boolean;
    status: LostItemStatusEnum;
    hotel: Hotel;
    room: Room;
    createdAt: Date;
    reportedBy: User;
}

// Daily Task Types
export enum DailyTaskStatusEnum {
    UNCLAIMED = 'UNCLAIMED',
    CLAIMED = 'CLAIMED',
}

export interface IDailyTask {
    id: number;
    description: string;
    status: DailyTaskStatusEnum;
    hotel: Hotel;
    rooms: Room[];
    createdAt: Date;
    housekeeper: User;
}

interface RestaurantItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    menuItem: {
        id: number;
        name: string;
        description: string;
        price: number;
        image: string | null;
    };
}

export interface IncomingOrder {
    id: number;
    requestId: number;
    requestDate: any;
    requestTable: string;
    requestRoom: string;
    orderType: 'DINE_IN' | 'ROOM' | 'NO_CHARGE' | 'TAKE_AWAY' | 'FAST_FOOD' | 'DELIVERY';
    guestName: string;
    status: 'PENDING' | 'DISPATCHED' | 'COMPLETED';
    receivedBy: string;
    createdAt: any;
    paymentMethod: string;
    paymentStatus:
        | 'Pending'
        | 'Added to bill'
        | 'Paid'
        | 'Cancelled'
        | 'Complemented'
        | 'BILL_SETTLED_FROM_FRONT_DESK';
    totalAmount: string;
    discountAmount: number;
    taxAmount: number;
    netAmount: number;
    waiter: any;
    items: RestaurantItem[];
    table?: any;
    room?: any;
}

export interface OrderItem {
    id: number | string;
    name: string;
    quantity: number;
    price: number;
    isReady?: boolean;
}

export interface OrderItemFormData {
    waiterName: string;
    guestName: string;
    guestEmail: string;
    phoneNumber: number;
    numberOfGuests: number;
    specialRequests: string;
    bookingTime: string;
    bookingDate: string;
}

export interface StatProps {
    title: string;
    currentValue: number;
    previousValue: number;
    percentageChange: number;
}
