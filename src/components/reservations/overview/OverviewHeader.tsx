import { PageHeadertitle } from '@/components/common/layout/Header';
import OverviewFilters from './OverviewFilters';

export default function OverviewHeader() {
    return (
        <div className="flex items-center justify-between bg-[#F9FCFF] px-[39px] w-full py-[24px]">
            <PageHeadertitle
                title="Reservations Overview"
                subtitle="All details about the reservations overview"
            />

            <OverviewFilters />
        </div>
    );
}
