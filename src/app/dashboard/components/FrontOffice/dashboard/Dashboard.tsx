import ActivityStream from './ActivityStream';
import Metrics from './Metrics';
import Notifications from './Notifications';
import QuickLinks from './QuickLinks';

function Dashboard() {
    return (
        <div className="relative min-h-screen p-4 bg-gray-100">
            <div className="flex flex-col gap-4">
                <QuickLinks />
                <Metrics />
            </div>

            <div className="flex gap-4 mt-4">
                <Notifications />
                <ActivityStream />
            </div>
        </div>
    );
}

export default Dashboard;
