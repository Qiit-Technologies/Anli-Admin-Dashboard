import DateRangeDropdown from '@/components/common/RangeDropdown';
import React from 'react';
import { DateSelection } from '../../types';

const ReservationSummaryHeader = ({ setStartDate, setEndDate }: any) => {
    return (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between w-full max-md:mt-5 mb-5">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl leading-tight font-semibold text-[#354052] max-md:text-[17px]">
                    Reservation Summary (Front Desk)
                </h1>
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

export default ReservationSummaryHeader;
