'use client';
import { PageHeadertitle } from '@/components/common/layout/Header';
import { StayViewLatest } from '@/components/front-office/stay-view';

const StayView = () => {
    return (
        <div>
            <div className="flex pt-6 pb-4 px-8 gap-6">
                <PageHeadertitle title="Stay View" />
            </div>
            <hr />
            <StayViewLatest />
        </div>
    );
};

export default StayView;
