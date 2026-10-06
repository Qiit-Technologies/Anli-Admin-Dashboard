export type OnboardingFormProps = {
    activeStep: number;
    setActiveStep: (val: number) => void;
    editing?: boolean;
    onUpdate?: () => Promise<void>;
    loadingUpdate?: boolean;
    setLoadingUpdate?: (val: boolean) => void;
};

export type MemberProfileProps = {
    member_id: string;
};
