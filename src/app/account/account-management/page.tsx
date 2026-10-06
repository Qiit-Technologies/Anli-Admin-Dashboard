'use client';
import { getIncomeSummary } from '@/app/actions/bank-accounts';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import SearchInput from '@/components/common/SearchInput';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@heroui/react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { LuBell } from 'react-icons/lu';
import useSWR from 'swr';

const AccountManagement = () => {
    const router = useRouter();
    const { data: departmentsSummary, isLoading } = useSWR(
        '/bank-accounts/income-summary',
        getIncomeSummary,
    );

    return (
        <PageWrapper className="px-0">
            <div className="px-8">
                <PageHeader>
                    <PageHeadertitle title="Account Management" />
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
            {isLoading ? (
                <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                    <Loader2 className="text-brand animate-spin w-10 h-10" />
                </div>
            ) : !departmentsSummary ? (
                <div className="flex justify-center items-center fixed top-0 left-0 z-100 w-screen h-screen">
                    <p className="text-xl text-center">
                        No active departments yet
                    </p>
                </div>
            ) : (
                <div className="px-8 ">
                    <div className="flex justify-between items-center">
                        <div className="">
                            <p className="text-[#222222] text-base leading-[29px]">
                                Departmental Income/Expenses Snapshot
                            </p>
                            <p className="text-[#667085] text-sm leading-6">
                                Showing each department’s current balance total
                                based on the accounts tagged to them.
                            </p>
                        </div>
                        {/* Use AddAccount trigger prop for the button */}
                        {/* <PermissionGate
                        permissions={[PERMISSIONS.ADD_ACCOUNT]}
                        blockType="modal"
                    >
                        <AddAccount
                            trigger={<Button>Add New Account</Button>}
                        />
                    </PermissionGate> */}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-8">
                        {departmentsSummary?.map((data: any) => (
                            <div
                                key={data.name}
                                onClick={() =>
                                    router.replace(
                                        `/account/account-management/${data.name}`,
                                    )
                                }
                                className="cursor-pointer rounded-lg shadow hover:shadow-md transition-all border border-[#E1E4EA] bg-[#FAFAFA] flex flex-col justify-between py-4 items-center h-[184px] px-[19px] w-[calc((100%-32px)/3)]"
                            >
                                <p className="text-[#3E4450] text-center text-base font-medium leading-5">
                                    {data.name}
                                </p>
                                <p className="text-[#101828] text-[36px] font-medium leading-[44px] tracking-[-0.72px]">
                                    {formatCurrency(data.amount)}
                                </p>
                                <div className="flex justify-between w-full items-center">
                                    <p className="text-[#667085] text-sm font-medium leading-5">
                                        No of account:{' '}
                                        <span className="text-base font-medium text-[#101828]">
                                            {data.noOfAccount}
                                        </span>
                                    </p>
                                    {/* <p
                                    className={`${data.growth ? 'text-[#336133]' : 'text-[#EE3C22]'} text-sm font-medium leading-5`}
                                >
                                    ▲ {data.diff}% Growth
                                </p> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default AccountManagement;
