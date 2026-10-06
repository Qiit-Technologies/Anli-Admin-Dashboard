'use client';
import { getEmployeePayrollDetails } from '@/app/actions/payroll';
import BrandButton from '@/components/common/Button';
import { PageHeader } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import { useParams } from 'next/navigation';
import { ReactNode } from 'react';
import useSWR from 'swr';

const InfoField = ({
    title,
    data,
}: {
    title: string;
    data: Array<{
        label: string;
        value: string | number | ReactNode;
        description?: string;
    }>;
}) => (
    <div className="w-full bg-white border rounded-xl p-4">
        <div className="font-semibold">
            <h1>{title}</h1>
        </div>
        <div className="flex flex-col mt-4 gap-4">
            {data.map((info, index) => (
                <div
                    key={`${info.label}-${index}`}
                    className="grid grid-cols-2 border-b py-1"
                >
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-start">
                            {info.label}
                        </span>
                        {info.description && (
                            <span className="text-xs text-muted-foreground">
                                {info.description}
                            </span>
                        )}
                    </div>
                    {typeof info.value === 'string' ||
                    typeof info.value === 'number' ? (
                        <span className="font-semibold text-end">
                            {info.value}
                        </span>
                    ) : (
                        <div className="ml-auto">{info.value}</div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const PayrollPage = () => {
    const { id: rawId } = useParams();
    const employeePayrollId =
        typeof rawId === 'string' ? rawId.replace(/^pay_/, '') : rawId;

    const { data: payroll, isLoading } = useSWR(
        employeePayrollId
            ? `/payroll/${employeePayrollId}/employee/payslip`
            : null,
        () => getEmployeePayrollDetails(employeePayrollId),
    );

    console.log(payroll?.data);
    if (!rawId) return <div>Error: Payroll Id Required</div>;
    if (isLoading || !payroll) return <div>Loading...</div>;

    const {
        fullName,
        jobDescription,
        paymentDate,
        dateOfJoining,
        salaryPeriod,
        grossSalary,
        deductionsTotal,
        netSalary,
        finalBreakdown,
        taxesAndContributions,
        deductions,
    } = payroll.data;

    return (
        <PageWrapper>
            <PageHeader>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href={`/employee/payroll/${rawId}`}
                    >
                        Back
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        Payslip
                    </BreadcrumbItem>
                </Breadcrumbs>
            </PageHeader>
            <hr />
            <div className="flex flex-col mt-5 gap-4 p-6 bg-[#031323] rounded-2xl">
                <div className="flex flex-col gap-4 md:flex-row items-center">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 col-span-3 gap-y-6 rounded-xl">
                        {[
                            {
                                label: 'Employee Name',
                                value: fullName,
                            },
                            {
                                label: 'Job Description',
                                value: jobDescription,
                            },
                            {
                                label: 'Payment',
                                value: salaryPeriod,
                            },
                            {
                                label: 'Date of Joining',
                                value: dateOfJoining,
                            },
                            {
                                label: 'Payment Date',
                                value: paymentDate,
                            },
                        ].map((dets, index) => (
                            <div
                                key={`${dets.label}-${index}`}
                                className="flex flex-col gap-4"
                            >
                                <span className="text-muted-foreground">
                                    {dets.label}
                                </span>
                                <span className="text-white">{dets.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 min-w-60 mt-6 md:mt-0">
                        <div className="flex flex-col gap-4">
                            <span className="text-muted-foreground">
                                Salary Payout
                            </span>
                            <span className="text-white text-2xl">
                                NGN {netSalary.toLocaleString()}
                            </span>
                            <BrandButton>Download Payslip</BrandButton>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField title="Final Net Salary" data={finalBreakdown} />
                <div className="flex flex-col gap-4">
                    <InfoField
                        title="Taxes and Contributions"
                        data={taxesAndContributions}
                    />
                    <InfoField title="Deductions" data={deductions} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 bg-white border text-lg font-bold p-4 rounded-lg">
                    <div className="flex flex-col">
                        <span className="text-start">
                            Total Earnings (Gross)
                        </span>
                    </div>
                    <span className="ml-auto">
                        NGN {grossSalary.toLocaleString()}
                    </span>
                </div>
                <div className="grid grid-cols-2 bg-white border text-lg font-bold p-4 rounded-lg">
                    <div className="flex flex-col">
                        <span className="text-start">Total Deductions</span>
                    </div>
                    <span className="ml-auto">
                        - NGN {deductionsTotal.toLocaleString()}
                    </span>
                </div>
            </div>
            <div className="w-full flex flex-col md:flex-row items-center justify-between bg-orange-700 text-lg text-white font-bold p-4 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-start">
                        Salary Payout = Total Earnings (Gross) - Total
                        Deductions
                    </span>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-fit mt-10 md:mt-0">
                    <span>Salary Payout</span>
                    <span>NGN {netSalary.toLocaleString()}</span>
                </div>
            </div>
        </PageWrapper>
    );
};

export default PayrollPage;
