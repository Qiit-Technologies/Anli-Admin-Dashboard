import Header from '@/components/reservations/layout/Header';
import OverviewHeader from '@/components/reservations/overview/OverviewHeader';
import { OverviewCalendarWithModals } from '@/components/reservations/overview/OverviewCalender';

export default function Overview() {
    return (
        <div className="bg-white">
            <Header />

            <OverviewHeader />

            <div className="pl-6 flex flex-col">
                <OverviewCalendarWithModals />
            </div>
        </div>
    );
}
