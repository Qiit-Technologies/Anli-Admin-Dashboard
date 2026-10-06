/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import CustomTable from '@/components/common/table/CustomTable';
import { useARAPColumns, type ARAPRow } from '../common/ARAPColumns';

export const PayableTable = ({
    data,
    onSelectionChange,
}: {
    data?: ARAPRow[];
    onSelectionChange?: (rows: ARAPRow[]) => void;
}) => {
    const columns = useARAPColumns('payables');

    return (
        <CustomTable
            hasHeader={false}
            columns={columns}
            data={data ?? []}
            onSelectionChange={onSelectionChange as any}
            rowClickSelect={true}
            singleSelect={true}
            fullWidth={true}
            headerClassName="pl-3 pr-3 min-w-[40px]"
            cellClassName="py-2 pl-3 pr-3 min-w-[40px]"
        />
    );
};
