const StepProgressBar = ({
    currentStep,
    totalSteps,
}: {
    currentStep: number;
    totalSteps: number;
}) => {
    return (
        <div className="flex w-full items-center justify-between">
            {Array.from({ length: totalSteps }, (_, index) => (
                <div
                    key={index}
                    className={`flex-1 h-1 mx-1 rounded-xl ${
                        index < currentStep ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                />
            ))}
        </div>
    );
};

export default StepProgressBar;
