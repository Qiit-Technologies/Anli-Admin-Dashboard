import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import CustomSidebar from '../common/layout/Sidebar';
// import { FeedbackButton } from '../common/FeedbackButton';
import { DailyRecognitionModal } from '../recognition/DailyRecognitionModal';
import { SubscriptionWarningBannerClient } from '../common/SubscriptionWarningBannerClient';

interface Props {
    children: ReactNode;
    scopedNavItems: any[];
    baseRoute: string;
}
const CustomLayout = async ({ children, baseRoute, scopedNavItems }: Props) => {
    const headersList = await headers();
    const headerRole = headersList.get('user-role');

    const userRole = headerRole;

    if (!userRole) {
        redirect('/signin');
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <CustomSidebar
                baseRoute={baseRoute}
                scopedNavItems={scopedNavItems}
                role={userRole}
            />
            <main className="bg-gray-50 flex-1 h-full overflow-auto flex flex-col">
                <SubscriptionWarningBannerClient />
                <div className="flex-1 overflow-auto">{children}</div>
                {/* <FeedbackButton /> */}
                <DailyRecognitionModal />
            </main>
        </div>
    );
};

export default CustomLayout;
