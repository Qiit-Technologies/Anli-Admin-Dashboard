'use client';

import { useState, useMemo } from 'react';
import { employeePayrollMockData } from '@/data/account/payroll/employee-payroll-mock-data';

export function usePayrollDetail(payrollId: string) {
    const [searchValue, setSearchValue] = useState('');
    const [employeeSearchValue, setEmployeeSearchValue] = useState('');

    // Get payroll detail data (in real app, fetch by ID)
    const payrollDetail = useMemo(() => {
        return (
            employeePayrollMockData.find((p) => p.id === payrollId) ||
            employeePayrollMockData[0]
        );
    }, [payrollId]);

    // Filter employees based on search
    const filteredEmployees = useMemo(() => {
        if (!employeeSearchValue) return payrollDetail.employees;

        return payrollDetail.employees.filter(
            (employee) =>
                employee.name
                    .toLowerCase()
                    .includes(employeeSearchValue.toLowerCase()) ||
                employee.role
                    .toLowerCase()
                    .includes(employeeSearchValue.toLowerCase()),
        );
    }, [payrollDetail.employees, employeeSearchValue]);

    const handleDownloadAll = () => {
        console.log('Download all payslips');
    };

    const handleApproveAll = () => {
        console.log('Approve all payments');
    };

    const handleFiltersClick = () => {
        console.log('Filters clicked');
    };

    return {
        payrollDetail,
        filteredEmployees,
        searchValue,
        setSearchValue,
        employeeSearchValue,
        setEmployeeSearchValue,
        handleDownloadAll,
        handleApproveAll,
        handleFiltersClick,
    };
}
