export interface EmployeePayroll {
    id: string;
    name: string;
    avatar: string;
    role: string;
    basePay: number;
    deductions: number;
    netSalary: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PayrollDetail {
    id: string;
    payrollRef: string;
    period: string;
    employees: EmployeePayroll[];
}
