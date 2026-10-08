export interface ControlSheetOrderPaymentRow {
  paymentMethod: string;
  amount: number;
  receivingAccount?: string;
  transactionReference?: string;
}

export interface ControlSheetOrderRow {
  orderId: number;
  orderRequestId?: string;
  orderDateTime: string;
  tableRoom: string;
  orderType: string;
  guestName: string;
  createdBy: string;
  orderStatus: string;
  orderAmount: number;
  complimentary: boolean;
  complimentaryAmount: number;
  paymentStatus: string;
  cash: number;
  transfer: number;
  card: number;
  pos: number;
  wallet: number;
  mobileMoney: number;
  otherPaymentMethods: Record<string, number>;
  receivingAccounts: Record<string, number>;
  payments: ControlSheetOrderPaymentRow[];
}

export interface ControlSheetWorkPeriod {
  id: number;
  area: string;
  openingTime: string;
  closingTime?: string;
  duration: string;
  status: string;
}

export interface ControlSheetReportData {
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  restaurantName?: string;
  restaurantLogo?: string;
  reportTitle: string;
  businessDate: string;
  generatedAt: string;
  generatedBy: string;
  hotelId: number;
  workPeriod?: ControlSheetWorkPeriod | null;
  orders: ControlSheetOrderRow[];
  summary: {
    totalOrders: number;
    complimentaryOrders: number;
    grandTotalSales: number;
    complimentaryTotal: number;
    cashTotal: number;
    transferTotal: number;
    cardTotal: number;
    posTotal: number;
    walletTotal: number;
    mobileMoneyTotal: number;
    otherPaymentTotals: Record<string, number>;
    receivingAccountTotals: Record<string, number>;
    totalRevenue: number;
  };
}
