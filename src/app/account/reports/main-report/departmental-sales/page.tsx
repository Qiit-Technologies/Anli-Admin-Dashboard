'use client';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import { Button } from '@heroui/react';
import { UploadCloud, ListFilter, Loader2 } from 'lucide-react';
import { LuBell } from 'react-icons/lu';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { departmentalSalesColumns } from '@/components/kitchen/tables/columns/departmentalSalesColumns';
import { useState, useEffect, useRef, useMemo } from 'react';
import useSWR from 'swr';
import { getSalesReport } from '@/app/actions/report';
import { downloadData } from '@/lib/downloadData';
import DateRangeDropdown from '@/components/common/RangeDropdown';
import { DateSelection } from '@/components/account/types';

const DepartmentalSales = () => {
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();

    const [searchValue, setSearchValue] = useState<string>('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        department: '',
        paymentMethod: '',
        servedBy: '',
    });
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    const { data: res, isLoading } = useSWR(
        ['getSalesReport', startDate, endDate],
        () => getSalesReport(startDate, endDate),
    );
    const salesReport = res?.data;
    console.log('salesReport', salesReport);
    const transactions = salesReport?.data || [];
    const summary = salesReport?.summary;

    // Get unique values for dynamic filtering
    const uniquePaymentMethods = useMemo(() => {
        if (!transactions) return [];
        const methods = transactions.map((t: any) => t.paymentMethod);
        return [...new Set(methods)].filter((method): method is string =>
            Boolean(method),
        );
    }, [transactions]);

    const uniqueServedBy = useMemo(() => {
        if (!transactions) return [];
        const staff = transactions.map((t: any) => t.servedBy);
        return [...new Set(staff)].filter(
            (staffMember): staffMember is string => Boolean(staffMember),
        );
    }, [transactions]);

    const uniqueDepartments = useMemo(() => {
        if (!transactions) return [];
        const depts = transactions.map((t: any) => t.department);
        return [...new Set(depts)].filter((dept): dept is string =>
            Boolean(dept),
        );
    }, [transactions]);

    // Define available filters based on the actual data
    const tableFilters: Array<{
        id: keyof typeof filterValues;
        label: string;
        options: Array<{ value: string; label: string }>;
    }> = [
        {
            id: 'department',
            label: 'Department',
            options: [
                // { value: '', label: 'All Departments' },
                ...uniqueDepartments.map((dept) => ({
                    value: dept,
                    label: dept,
                })),
            ],
        },
        {
            id: 'paymentMethod',
            label: 'Payment Method',
            options: [
                // { value: '', label: 'All Payment Methods' },
                ...uniquePaymentMethods.map((method) => ({
                    value: method,
                    label: method,
                })),
            ],
        },
        {
            id: 'servedBy',
            label: 'Served By',
            options: [
                // { value: '', label: 'All Staff' },
                ...uniqueServedBy.map((staff) => ({
                    value: staff,
                    label: staff,
                })),
            ],
        },
    ];

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node)
            ) {
                setIsFilterDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter sales report based on selected filter values and search
    const filteredSalesReport = useMemo(() => {
        if (!transactions) return [];

        let filtered = transactions.filter((report: any) => {
            // Filter by department (you might need to add department field to your sales report)
            if (
                filterValues.department &&
                report.department !== filterValues.department
            ) {
                return false;
            }

            // Filter by payment method
            if (
                filterValues.paymentMethod &&
                report.paymentMethod !== filterValues.paymentMethod
            ) {
                return false;
            }

            // Filter by served by
            if (
                filterValues.servedBy &&
                report.servedBy !== filterValues.servedBy
            ) {
                return false;
            }

            return true;
        });

        // Apply search filter if search value exists
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter((report: any) => {
                return (
                    report.orderID?.toLowerCase().includes(searchLower) ||
                    report.tableRoom?.toLowerCase().includes(searchLower) ||
                    report.itemsSold?.toLowerCase().includes(searchLower) ||
                    report.amount?.toLowerCase().includes(searchLower) ||
                    report.paymentMethod?.toLowerCase().includes(searchLower) ||
                    report.date?.toLowerCase().includes(searchLower) ||
                    report.servedBy?.toLowerCase().includes(searchLower)
                );
            });
        }

        return filtered;
    }, [transactions, filterValues, searchValue]);

    // const departments = activeDepartments?.map(
    //     (activeDeps: { name: string }) => activeDeps.name,
    // );

    const myData = filteredSalesReport?.map((report: any) => ({
        'Order ID': report?.orderID,
        'Table/Room': report?.tableRoom,
        'Items Sold': report?.itemsSold,
        Amount: report?.amount,
        'Payment Method': report?.paymentMethod,
        Date: report?.date,
        'Served By': report?.servedBy,
    }));

    return (
        <>
            <PageWrapper className="px-0">
                <div className="px-8">
                    <PageHeader>
                        <PageHeadertitle title="Reports" />
                        <div className="ml-auto flex items-center">
                            <SearchInput
                                className="w-full lg:w-[320px]"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <Button
                                variant="light"
                                isIconOnly
                                className="ml-4 bg-white rounded-full border text-gray-400"
                            >
                                <LuBell size={18} />
                            </Button>
                        </div>
                    </PageHeader>
                </div>
                <div className="bg-[#D3D3D3] h-[1px] w-full" />
                <div className="px-8">
                    <div className="flex justify-between items-center">
                        <div className="">
                            <p className="text-[#354052] text-2xl font-semibold leading-[29px]">
                                Departmental Sales Reports
                            </p>
                            <p className="text-[#000] text-sm leading-6">
                                Your daily snapshot of overall business
                                performance
                            </p>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                            <DateRangeDropdown
                                handleSelection={(selection: DateSelection) => {
                                    setStartDate(selection?.startDate);
                                    setEndDate(selection?.endDate);
                                }}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                            <Loader2 className="text-brand animate-spin w-10 h-10" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Statistics */}
                            {summary && (
                                <div className="flex items-center gap-4 mb-6 mt-8">
                                    <div className="px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]">
                                        <p className="text-black text-[20px] font-medium leading-5">
                                            Total Orders:{' '}
                                            <span className="font-bold">
                                                {summary.totalOrders}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]">
                                        <p className="text-black text-[20px] font-medium leading-5">
                                            Total Revenue:{' '}
                                            <span className="font-bold">
                                                ₦
                                                {summary.totalRevenue?.toLocaleString()}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]">
                                        <p className="text-black text-[20px] font-medium leading-5">
                                            Completed Orders:{' '}
                                            <span className="font-bold">
                                                {summary.completedOrders}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]">
                                        <p className="text-black text-[20px] font-medium leading-5">
                                            Paid Orders:{' '}
                                            <span className="font-bold">
                                                {summary.paidOrders}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mb-5 mt-8">
                                {/* <div className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px w-fit">
                                    <Calendar size={20} />
                                    <p className="text-base text-[#344054]">
                                        Start date - End date
                                    </p>
                                </div> */}

                                {/* <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                                        {departments?.map((dep: string) => (
                                            <option key={dep}>{dep}</option>
                                        ))}
                                    </select>
                                </div> */}
                                {/* <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                                        <option>Payment method</option>
                                        <option>Payment method</option>
                                    </select>
                                </div> */}
                                {/* <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                                        <option>Expense Type</option>
                                        <option>Expense Type</option>
                                    </select>
                                </div> */}
                            </div>
                            {/* <div className="flex items-center gap-2 mb-8 justify-between w-fit">
                                <p className="text-[#1F0702] text-sm font-medium leading-6">
                                    Select Waiter/Waitress
                                </p>
                                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                                    <select className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent">
                                        <option>Grace James</option>
                                        <option>Grace James</option>
                                    </select>
                                </div>
                            </div> */}

                            <div className="flex items-center gap-4 mb-5 justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <p className="text-black text-base font-bold leading-6 whitespace-nowrap">
                                        Sales Records:{' '}
                                        {filteredSalesReport?.length ||
                                            transactions?.length ||
                                            0}
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                {isFilterDropdownOpen && (
                                    <div
                                        ref={filterDropdownRef}
                                        className="absolute top-[50px] right-[146px] mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-[1000] p-4"
                                    >
                                        <div className="flex flex-col space-y-4">
                                            {tableFilters.map((filter) => (
                                                <div
                                                    key={filter.id}
                                                    className="space-y-2"
                                                >
                                                    <label
                                                        className="text-muted-foreground text-sm"
                                                        htmlFor={filter.id}
                                                    >
                                                        {filter.label}
                                                    </label>
                                                    <select
                                                        className="w-full px-3 py-2 text-sm bg-gray-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                                                        value={
                                                            filterValues[
                                                                filter.id as keyof typeof filterValues
                                                            ] || ''
                                                        }
                                                        onChange={(e) => {
                                                            setFilterValues(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [filter.id]:
                                                                        e.target
                                                                            .value,
                                                                }),
                                                            );
                                                        }}
                                                    >
                                                        <option value="">
                                                            All {filter.label}
                                                        </option>
                                                        {filter.options.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            ))}
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    className="px-3 py-2 text-sm bg-orion-blue hover:bg-orion-blue text-white rounded-md"
                                                    onClick={() => {
                                                        setFilterValues({
                                                            department: '',
                                                            paymentMethod: '',
                                                            servedBy: '',
                                                        });
                                                    }}
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                                    onClick={() =>
                                                        setIsFilterDropdownOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <CustomTable
                                    isPaginated={true}
                                    paginationSize={10}
                                    hasHeader
                                    rightHeader={
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <button
                                                    className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                        Object.values(
                                                            filterValues,
                                                        ).some((value) => value)
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-300'
                                                    }`}
                                                    onClick={() =>
                                                        setIsFilterDropdownOpen(
                                                            !isFilterDropdownOpen,
                                                        )
                                                    }
                                                >
                                                    <ListFilter size={16} />
                                                    More filters
                                                    {Object.values(
                                                        filterValues,
                                                    ).some(
                                                        (value) => value,
                                                    ) && (
                                                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                                                            {
                                                                Object.values(
                                                                    filterValues,
                                                                ).filter(
                                                                    (value) =>
                                                                        value,
                                                                ).length
                                                            }
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                            <div
                                                onClick={() =>
                                                    downloadData(
                                                        myData,
                                                        'xlsx',
                                                        'Sales Report',
                                                    )
                                                }
                                                className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px"
                                            >
                                                <UploadCloud size={20} />
                                                <p className="text-base text-[#344054]">
                                                    Export Report
                                                </p>
                                            </div>
                                        </div>
                                    }
                                    title="Report Output Table"
                                    columns={departmentalSalesColumns}
                                    data={filteredSalesReport || []}
                                />
                            </div>
                        </>
                    )}
                </div>
            </PageWrapper>
        </>
    );
};

export default DepartmentalSales;
