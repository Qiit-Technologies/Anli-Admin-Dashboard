'use client';
import { UploadCloud } from 'lucide-react';
import { remainingStockColumns } from '@/components/kitchen/tables/columns/remainingStockColumns';
import CustomTable from '@/components/front-of-house/tables/CustomTable';
import { downloadData } from '@/lib/downloadData';

const RemainingStock = ({ fetchedStock }: any) => {
    const dataToUse = fetchedStock?.allItems?.map((stock: any) => ({
        itemName: stock?.name,
        description: stock?.description,
        currentQty: stock?.quantity,
        unit: stock?.unitOfMeasurement,
    }));

    const myData = fetchedStock?.allItems?.map((stock: any) => ({
        'Item Name': stock?.name,
        Description: stock?.description,
        'Current Qty': stock?.quantity,
        Unit: stock?.unitOfMeasurement,
    }));

    // Calculate total issued from stock requests (not from all items)
    const issuedStock =
        fetchedStock?.allStockRequest?.reduce(
            (sum: number, stock: any) => sum + Number(stock.quantity || 0),
            0,
        ) || 0;

    // Calculate total remaining from all items
    const remainingStock =
        fetchedStock?.allItems?.reduce(
            (sum: number, item: any) => sum + Number(item.quantity || 0),
            0,
        ) || 0;

    // Calculate low stock alerts
    const lowStockAlerts =
        fetchedStock?.allItems?.reduce((sum: number, item: any) => {
            if (item.quantity <= item.minStock) return sum + 1;
            else return sum;
        }, 0) || 0;
    return (
        <>
            <div className="flex items-center gap-4 my-4">
                <div
                    className={`px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]`}
                >
                    <p className="text-black text-[20px] font-medium leading-5">
                        Total Issued:{' '}
                        <span className="font-bold">{issuedStock}</span>
                    </p>
                </div>
                <div
                    className={`px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]`}
                >
                    <p className="text-black text-[20px] font-medium leading-5">
                        Total Remaining:{' '}
                        <span className="font-bold">{remainingStock}</span>
                    </p>
                </div>
                <div
                    className={`px-5 py-[18px] bg-[#FCF4F4] rounded-2xl text-[#676464]`}
                >
                    <p className="text-black text-[20px] font-medium leading-5">
                        Low Stock Alerts:{' '}
                        <span className="font-bold">{lowStockAlerts}</span>
                    </p>
                </div>
            </div>
            <CustomTable
                isPaginated={false}
                hasHeader
                title="Remaining Stock Report"
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
                        <p className="text-base text-[#344054]">
                            Export Report
                        </p>
                    </div>
                }
                columns={remainingStockColumns}
                data={dataToUse || []}
            />
        </>
    );
};

export default RemainingStock;
