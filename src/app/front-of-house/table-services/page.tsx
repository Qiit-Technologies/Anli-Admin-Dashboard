'use client';
import FoodMenu from '@/components/front-of-house/FoodMenu';
import TableServiceComponent from '@/components/front-of-house/TableServices';
import { useSteps } from '@/hooks/useSteps';
import { useMemo } from 'react';

const TableServicesPage = () => {
    const { currentStepIndex, next, back, reset } = useSteps();

    const steps = useMemo(
        () => [
            {
                label: 'Select Table',
                component: <TableServiceComponent onTableSelect={next} />,
            },
            {
                label: 'Food Menu',
                component: <FoodMenu onOrderComplete={reset} goBack={back} />,
            },
        ],
        [back, next, reset],
    );

    return (
        <div className="flex flex-col gap-4">
            {steps[currentStepIndex].component}
        </div>
    );
};

export default TableServicesPage;
