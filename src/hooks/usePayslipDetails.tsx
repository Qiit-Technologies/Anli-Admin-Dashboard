'use client';

export function usePayslipDetail(payrollId: string, employeeId: string) {
    const handleApprovePayment = () => {
        console.log('Approve payment for employee:', employeeId);
    };

    const handleDownloadPayslip = () => {
        console.log('Download payslip for employee:', employeeId);
    };

    return {
        handleApprovePayment,
        handleDownloadPayslip,
    };
}
