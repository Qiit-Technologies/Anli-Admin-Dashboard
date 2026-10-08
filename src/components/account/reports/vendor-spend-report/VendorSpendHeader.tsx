import DateRangeDropdown from '@/components/common/RangeDropdown';
import React from 'react';
import { DateSelection } from '../../types';

const VendorSpendHeader = ({ setStartDate, setEndDate }: any) => {
    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
            <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-[#354052] max-md:text-[17px]">
                    Vendor Spend Report
                </h1>
                <p className="text-[#7C8493] text-sm md:text-base mt-1 max-w-xl max-md:text-[12px]">
                    Track how much has been spent with each vendor
                </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
                <DateRangeDropdown
                    handleSelection={(selection: DateSelection) => {
                        setStartDate(selection?.startDate);
                        setEndDate(selection?.endDate);
                    }}
                />
            </div>
        </div>
    );
};

export default VendorSpendHeader;
