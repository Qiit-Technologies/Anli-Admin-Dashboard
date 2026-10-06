'use client';
import { UploadCloud } from 'lucide-react';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { stockByStaffColumns } from '@/components/kitchen/tables/columns/stockByStaffColumns';
import { format } from 'date-fns';
import { downloadData } from '@/lib/downloadData';
import { useEffect, useMemo, useState } from 'react';

const StockByStaff = ({ fetchedStock }: any) => {
    const [data, setData] = useState([]);
    const [staff, setStaff] = useState('');
    // Filter staff to only show those with stock-related roles
    const stockStaff = useMemo(() => {
        if (!fetchedStock?.activeStaffs) return [];
        return fetchedStock.activeStaffs.filter((staff: any) => {
            const roleName = staff?.roles?.name?.toLowerCase();
            return (
                roleName === 'stockofficer' ||
                roleName === 'stockmanager' ||
                roleName === 'manager' ||
                roleName === 'administrator' ||
                roleName === 'general manager' ||
                roleName === 'supervisor'
            );
        });
    }, [fetchedStock?.activeStaffs]);

    useEffect(() => {
        const dataToUse = fetchedStock?.allStockActivities?.map(
            (stock: any) => ({
                itemName: stock?.item?.name,
                action: stock?.action,
                currentQty: stock?.quantity,
                date: format(new Date(stock?.createdAt), 'dd-MM-yyyy'),
                department: stock?.department,
                staffName: stock?.staff?.fullName,
            }),
        );
        const filteredData = dataToUse.filter((data: any) => {
            console.log('data.staffName === staff', data.staffName, staff);
            if (!staff) return true;
            if (staff) {
                return data.staffName === staff;
            }
        });
        setData(filteredData);
    }, [fetchedStock?.allStockActivities, staff]);

    const myData = fetchedStock?.allStockActivities?.map((stock: any) => ({
        'Item Name': stock?.item?.name,
        Action: stock?.action,
        'Current Qty': stock?.quantity,
        Date: format(new Date(stock?.createdAt), 'yyyy-MM-dd HH:mm'),
        Department: stock?.department,
        'Staff Name': stock?.staff?.fullName,
    }));

    const handleStaffChange = (staffValue: string) => {
        setStaff(staffValue);
    };

    return (
        <>
            <div className="flex items-center gap-2 mb-8 justify-start w-fit">
                <p className="text-[#1F0702] text-sm font-medium leading-6">
                    Select Staff
                </p>
                <div className="px-3 py-3 rounded-lg shadow border border-[#E1E4EA] text-[#0E121B] text-sm font-normal leading-5">
                    <select
                        onChange={(e) => handleStaffChange(e.target.value)}
                        className="border-none outline-none focus:outline-none focus:ring-0 focus:border-none hover:border-none active:border-none bg-transparent"
                    >
                        <option value="">All Stock Staff</option>
                        {stockStaff?.map((staff: any) => (
                            <option key={staff.id} value={staff.fullName}>
                                {staff.fullName} ({staff.roles?.name})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <CustomTable
                paginationSize={10}
                hasHeader
                title="Stock by Staff (Issued/Received)"
                rightHeader={
                    <div
                        onClick={() =>
                            downloadData(
                                myData,
                                'xlsx',
                                'Stock By Staff Report',
                            )
                        }
                        className="cursor-pointer px-4 py-[10px] rounded-lg border border-[#D0D5DD] flex gap-2 justify-center items-center h-44px"
                    >
                        <UploadCloud size={20} />
                        <p className="text-base text-[#354054]">
                            Export Report
                        </p>
                    </div>
                }
                columns={stockByStaffColumns}
                data={data || []}
            />
        </>
    );
};

export default StockByStaff;
