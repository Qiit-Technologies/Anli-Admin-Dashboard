import { memo, useMemo } from 'react';

type Step = {
    id: string;
    title: string;
    description: string;
};

const steps: Step[] = [
    {
        id: 'choose-service',
        title: 'Choose Service',
        description:
            'Setting up shop allows the tailor to reach more customers on regalia.',
    },
    {
        id: 'verification-process',
        title: 'Verification Process',
        description:
            'This allows customers easy access to locate tailors around them.',
    },
    // {
    //     id: 'welcome-to-anli',
    //     title: 'Welcome to Anli',
    //     description:
    //         'This allows customers easy access to locate tailors around them.',
    // },
];

type SideBarProps = {
    currentStep: number;
};

const CheckmarkIcon = memo(() => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
        />
    </svg>
));
CheckmarkIcon.displayName = 'CheckmarkIcon';

type StepItemProps = {
    step: Step;
    isActive: boolean;
};

const StepItem = memo(({ step, isActive }: StepItemProps) => {
    return (
        <li className="flex items-start">
            <span
                className={`flex-shrink-0 w-5 h-5 mr-4 rounded-md border-2 flex items-center justify-center
                ${
                    isActive
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-gray-400 bg-white text-gray-400'
                }`}
            >
                <CheckmarkIcon />
            </span>
            <div>
                <h3 className="font-semibold text-gray-800">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.description}</p>
            </div>
        </li>
    );
});
StepItem.displayName = 'StepItem';

const SideBar = ({ currentStep }: SideBarProps) => {
    const renderedSteps = useMemo(
        () =>
            steps.map((step, index) => (
                <StepItem
                    key={step.id}
                    step={step}
                    isActive={index <= currentStep}
                />
            )),
        [currentStep],
    );

    return (
        <div className="bg-gray-100 p-6 w-full max-w-xs">
            <ul className="relative space-y-6 top-1/4">{renderedSteps}</ul>
        </div>
    );
};

SideBar.displayName = 'SideBar';

export default memo(SideBar);
