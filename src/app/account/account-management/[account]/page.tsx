'use client';
import { getAccountsByDepartment } from '@/app/actions/bank-accounts';
import { PageHeader } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { AccountMngtColumnsColumns } from '@/components/kitchen/tables/columns/AccountMngtColumns';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@heroui/react';
import { ChevronRight, ListFilter } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const AccountDetails = () => {
    const params = useParams();
    const router = useRouter();
    let departmentId = params?.account || '';
    if (Array.isArray(departmentId)) {
        departmentId = departmentId[0];
    }
    const [searchValue, setSearchValue] = useState<string>('');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [filterValues, setFilterValues] = useState({
        accountType: '',
        bankName: '',
    });
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    const {
        data: accountsData,
        isLoading,
        error,
    } = useSWR(
        departmentId ? `/bank-accounts/by-department/${departmentId}` : null,
        () => getAccountsByDepartment(departmentId),
    );
    const accounts = Array.isArray(accountsData) ? accountsData : [];

    // Get unique values for dynamic filtering
    const uniqueBank = useMemo(() => {
        if (!accounts) return [];
        const methods = accounts.map((t: any) => t.bankName);
        return [...new Set(methods)].filter((method): method is string =>
            Boolean(method),
        );
    }, [accounts]);

    // Define available filters based on the actual data
    const tableFilters: Array<{
        id: keyof typeof filterValues;
        label: string;
        options: Array<{ value: string; label: string }>;
    }> = [
        {
            id: 'accountType',
            label: 'Account Type',
            options: [
                { value: 'SAVINGS', label: 'SAVINGS' },
                { value: 'CURRENT', label: 'CURRENT' },
            ],
        },
        {
            id: 'bankName',
            label: 'Bank Name',
            options: [
                ...uniqueBank.map((method) => ({
                    value: method,
                    label: method,
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

    const filteredAccounts = useMemo(() => {
        if (!accounts) return [];

        let filtered = accounts.filter((report: any) => {
            // Filter by department (you might need to add department field to your sales report)
            if (
                filterValues.bankName &&
                report.bankName !== filterValues.bankName
            ) {
                return false;
            }

            // Filter by payment method
            if (
                filterValues.accountType &&
                report.accountType !== filterValues.accountType
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
                    report.accountType?.toLowerCase().includes(searchLower) ||
                    report.bankName?.toLowerCase().includes(searchLower) ||
                    report.accountNumber?.toLowerCase().includes(searchLower) ||
                    report.accountName?.toLowerCase().includes(searchLower) ||
                    report.module?.toLowerCase().includes(searchLower)
                );
            });
        }

        return filtered;
    }, [accounts, filterValues, searchValue]);

    if (error) {
        return <div className="p-8 text-red-500">Error loading accounts.</div>;
    }

    return (
        <PageWrapper className="px-0">
            <div className="px-8">
                <PageHeader>
                    <div className="flex items-center gap-2">
                        <h1
                            className="text-xl font-medium text-[#71717A] cursor-pointer"
                            onClick={router.back}
                        >
                            Accounts
                        </h1>
                        <ChevronRight className="ml-2 text-[#71717A]" />

                        <h1 className="text-2xl font-semibold text-gray-900">
                            Account Management
                        </h1>
                    </div>
                    <div className="ml-auto flex items-center">
                        <SearchInput
                            className="w-full lg:w-[320px]"
                            value={''}
                            onChange={() => {}}
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
            <div className="px-8 ">
                <div className="rounded-3xl border border-[#B1BDD4] flex bg-[#031323] text-white justify-between px-[33px] pt-[28px] pb-[46px] w-full">
                    <div className="flex flex-col justify-between gap-6">
                        <div className="flex gap-10 items-center">
                            <div>
                                <p className="text-[#667085] text-xs font-normal leading-[18px]">
                                    Assigned Department
                                </p>
                                <p className="mt-2 text-base font-semibold leading-[26px]">
                                    {/* You may want to fetch and display department name here */}
                                    {decodeURIComponent(departmentId)}
                                </p>
                            </div>
                            <div>
                                <p className="text-[#667085] text-xs font-normal leading-[18px]">
                                    Currency
                                </p>
                                <p className="mt-2 text-base font-semibold leading-[26px]">
                                    NGN
                                </p>
                            </div>
                            <div>
                                <p className="text-[#667085] text-xs font-normal leading-[18px]">
                                    No of account assigned
                                </p>
                                <p className="mt-2 text-base font-semibold leading-[26px]">
                                    {accounts.length}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[#898282] text-base font-medium leading-[26px]">
                                Total Balance
                            </p>
                            <p className="mt-3 text-[40px] font-semibold leading-[26px]">
                                {formatCurrency(
                                    accounts.reduce(
                                        (sum, acc) =>
                                            sum + (Number(acc.balance) || 0),
                                        0,
                                    ),
                                )}
                            </p>
                        </div>
                    </div>
                    {/* Use AddAccount trigger prop for the button */}
                    {/* <PermissionGate
                        permissions={[PERMISSIONS.ADD_ACCOUNT]}
                        blockType="modal"
                    >
                        <AddAccount
                            trigger={
                                <Button className="bg-orion-blue hover:bg-orion-blue text-[#F3F3F3] text-sm font-medium leading-5 px-[10px] py-4 rounded-lg">
                                    Add New Account
                                </Button>
                            }
                        />
                    </PermissionGate> */}
                </div>
                <div className="mt-8">
                    {isLoading ? (
                        <div>Loading accounts...</div>
                    ) : (
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
                                                                {option.label}
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
                                                        accountType: '',
                                                        bankName: '',
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
                                isPaginated={false}
                                hasHeader
                                rightHeader={
                                    <div className="ml-auto flex items-center gap-2">
                                        <SearchInput
                                            className="w-full lg:w-[230px] h-[44px] border border-[#D0D5DD] rounded-lg"
                                            value={searchValue}
                                            onChange={(e) =>
                                                setSearchValue(e.target.value)
                                            }
                                        />
                                        <div className="relative">
                                            <button
                                                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 text-sm border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                                                ).some((value) => value) && (
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
                                    </div>
                                }
                                title={`All account assigned to ${decodeURIComponent(departmentId)}`}
                                columns={AccountMngtColumnsColumns}
                                data={filteredAccounts}
                            />
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default AccountDetails;
