'use client';

import EventsCalendarPage from '@/components/banquest/events/EventsCalendarPage';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const EventsPage = () => {
    return (
        <PageWrapper className="lg:px-0 gap-0 bg-gray-50/50">
            <PageHeader>
                <div className="flex w-full flex-row items-center justify-between">
                    <PageHeadertitle title="Events" subtitle="" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-10 w-10 rounded-full text-muted-foreground hover:bg-gray-50"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                </div>
            </PageHeader>
            <EventsCalendarPage />
        </PageWrapper>
    );
};

export default EventsPage;
