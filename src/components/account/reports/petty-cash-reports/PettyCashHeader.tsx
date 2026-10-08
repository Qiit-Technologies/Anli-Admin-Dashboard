import DateRangeDropdown from '@/components/common/RangeDropdown';
import React from 'react';
import { DateSelection } from '../../types';

const PettyCashHeader = ({ setStartDate, setEndDate }: any) => {
    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between w-full pb-6 mt-6 md:mt-[33px]">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl leading-tight font-semibold text-[#354052] max-md:text-[17px]">
                    Petty Cash Reports
                </h1>
                <p className="text-[#7C8493] text-[15px] leading-snug max-w-2xl max-md:text-[12px]">
                    Your daily snapps report helps users track all
                    department-specific expenses, with flexible filtering and
                    rich details.hot of overall business performance
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

export default PettyCashHeader;
