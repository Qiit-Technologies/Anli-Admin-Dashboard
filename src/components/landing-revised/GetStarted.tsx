import NewSection from './layout/NewSection';

const GetStarted = () => {
    return (
        <NewSection
            bgClassName="relative"
            bgChildren={
                <img
                    src="/landing/layer-icons/layer7.svg"
                    className="absolute top-0 left-0 z-10"
                />
            }
            className="w-full pt-[41px] lg:pt-[72px] pb-[100px] px-10"
        >
            <p className="text-[#002955] text-[32px] lg:text-[48px] font-bold leading-[40px] lg:leading-[63px] tracking-[-0.64px] lg:tracking-[-0.96px] max-w-[268px] lg:max-w-[694px]">
                Get Started with Anli in 3 Simple Steps
            </p>

            <div className="h-fit lg:h-[380.999px] mx-auto flex flex-col lg:flex-row justify-center items-center lg:items-start mt-[52px] lg:mt-[104px] gap-10 lg:gap-0">
                <div className="w-fit lg:w-[265px] mt-[26px]">
                    <img
                        src="/landing/get-started/icon1.svg"
                        className="mx-auto w-[141px] h-[133px]"
                    />
                    <p className="mt-4 text-[#002955] text-[20px] font-semibold leading-[34px] tracking-[-0.4px] text-center mx-auto w-[238px]">
                        Book a quick 30-minute call with an Anli expert.
                    </p>
                </div>
                <img
                    src="/landing/get-started/arrow.svg"
                    className="hidden lg:block h-auto w-[162.975px] -mr-[80px] mt-[45px] self-start"
                />
                <div className="w-fit lg:w-[397px] self-end">
                    <img
                        src="/landing/get-started/icon2.svg"
                        className="mx-auto w-[141px] h-[133px]"
                    />
                    <p className="mt-4 text-[#002955] text-[20px] font-semibold leading-[34px] tracking-[-0.4px] text-center">
                        Experience a tailored demo and discover how Anli
                        transforms your hotel or restaurant operations.
                    </p>
                </div>
                <img
                    src="/landing/get-started/arrow2.svg"
                    className="hidden lg:block w-[194.711px] -ml-[80px] self-start"
                />
                <div className="w-fit lg:w-[355px]  mt-[26px]">
                    <img
                        src="/landing/get-started/icon3.svg"
                        className="mx-auto w-[141px] h-[133px]"
                    />
                    <p className="mt-4 text-[#002955] text-[20px] font-semibold leading-[34px] tracking-[-0.4px] text-center">
                        Seamless onboarding to start boosting revenue and
                        delighting guests right away.
                    </p>
                </div>
            </div>
        </NewSection>
    );
};

export default GetStarted;
