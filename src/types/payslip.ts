export interface SalaryItem {
    label: string;
    amount: number;
    value: number | string;
    isDeduction?: boolean;
}

export interface TaxContribution {
    type: string;
    code: string;
    description: string;
    amount: number;
    label: string;
    value: number | string;
}

export interface Deduction {
    description: string;
    amount: number;
    value: string;
    label: string;
}

export interface PayslipDetail {
    employeeId: string;
    employeeName: string;
    jobDescription: string;
    paymentPeriod: string;
    dateOfJoining: string;
    paymentDate: string;
    salaryPayout: number;
    salaryItems: SalaryItem[];
    taxesAndContributions: TaxContribution[];
    deductions: Deduction[];
    totalEarnings: number;
    totalDeductions: number;
    finalPayout: number;
}
