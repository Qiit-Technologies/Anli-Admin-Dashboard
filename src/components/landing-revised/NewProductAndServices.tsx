import Section from './layout/Section';

const NewProductAndServices = () => {
    return (
        <div className="w-full">
            <Section
                bgClassName="w-full"
                className="mb-0 lg:mb-[99px] mt-[55px]"
            >
                <button className="mx-auto rounded-full border-dashed border-[#FF910C] bg-[#002955] p-3 w-[166px] cursor-pointer flex justify-center">
                    <p className="text-[#E8ECF5] text-[12px] font-semibold leading-[20px] tracking-[-0.24px]">
                        Products & Services
                    </p>
                </button>

                <p className="text-[#101828] text-[32px] lg:text-[48px] font-bold leading-[43px] lg:leading-[53px] tracking-[-0.64px] lg:tracking-[-0.96px] mt-8 text-center max-w-[950px] mx-auto">
                    How ANLI makes daily Hotel & Restaurant operations better
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-0 lg:gap-x-[38px] gap-y-10 lg:gap-y-[49px] mt-[58px]">
                    <div className="lg:col-span-2 flex flex-col lg:flex-row gap-9 h-[529px] lg:h-[412px] rounded-[24px] items-stretch bg-[#FFF6EB] justify-between pt-8 lg:pt-6 relative overflow-hidden">
                        <img
                            alt="layer-icons"
                            src="/landing/layer-icons/layer3.svg"
                            className="absolute top-0 right-0 z-10"
                        />

                        <img
                            alt="layer-icons"
                            src="/landing/layer-icons/layer4.svg"
                            className="absolute bottom-0 left-0 z-10"
                        />
                        <div className="-mt-6 max-w-[600px] px-8 lg:pl-[63px] lg:pr-0 flex flex-col h-full justify-center">
                            <p className="text-[#241102] text-[24px] lg:text-[36px] font-semibold leading-[38px]">
                                Front Office Module
                            </p>
                            <ul
                                style={{ listStyle: 'disc' }}
                                className="pl-5 mt-5 lg:mt-10 text-[#241102] text-[14px] lg:text-[18px] font-medium leading-[21px] lg:leading-[38px]"
                            >
                                <li>
                                    Speed up check-ins and check-outs by up to
                                    40%
                                </li>
                                <li>
                                    Reduce booking errors by 30%, securing more
                                    confirmed reservations.
                                </li>
                            </ul>
                        </div>
                        <img
                            alt="layer-icons"
                            src="/landing/services/services1.svg"
                            className="ml-[30px] lg:ml-0"
                        />
                    </div>
                    <div className="flex flex-col justify-between lg:items-end w-full h-[545px] lg:h-[636px] rounded-[24px] bg-[#E4F1FF]">
                        <div className="pt-11 lg:pt-12 px-4 lg:px-10">
                            <p className="text-[#002955] text-[24px] lg:text-[36px] font-semibold leading-[38px]">
                                Restaurant Module
                            </p>
                            <ul
                                style={{ listStyle: 'disc' }}
                                className="pl-5 mt-6 text-[#241102] text-[14px] lg:text-[18px] font-medium leading-[27px] lg:leading-[38px]"
                            >
                                <li>
                                    Deliver meals 20–30% faster with linked POS
                                    and front-desk orders.
                                </li>
                                <li>
                                    Guests enjoy a better experience with
                                    real-time menu updates, so they always know
                                    what’s available and get exactly what they
                                    ordered.
                                </li>
                            </ul>
                        </div>
                        <img
                            alt="layer-icons"
                            className="h-[321.571px] w-auto"
                            src="/landing/services/services4.png"
                        />
                    </div>

                    <div className="flex flex-col justify-between items-stretch lg:items-end w-full h-[518px] lg:h-[636px] rounded-[24px] bg-[#EEE6FE] relative overflow-hidden">
                        <img
                            alt="layer-icons"
                            src="/landing/layer-icons/layer5.svg"
                            className="absolute top-20 right-0 z-10"
                        />
                        <img
                            alt="layer-icons"
                            className="ml-[67px] -mr-2 lg:mr-0 -mt-1 lg:mt-0 lg:ml-0 h-[272.017px] lg:h-[321.571px] w-auto relative z-20"
                            src="/landing/services/services2.svg"
                        />
                        <div className="pb-12 px-7 lg:px-10 text-[#002955] ">
                            <p className="text-[24px] lg:text-[36px] font-semibold leading-[38px]">
                                Housekeeping
                            </p>
                            <ul
                                style={{ listStyle: 'disc' }}
                                className="pl-5 mt-4 lg:mt-10 text-[14px] lg:text-[18px] font-medium leading-[28px] lg:leading-[38px]"
                            >
                                <li>
                                    Update room status 50% faster, with
                                    real-time clean/ready notifications.
                                </li>
                                <li>
                                    Reduce guest wait time on arrival with
                                    quicker room preparation and updates.
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col-reverse lg:flex-row gap-9 h-[560px] lg:h-[412px] rounded-[24px] items-stretch bg-[#FFF4F7] justify-between lg:pt-6 relative overflow-hidden">
                        <img
                            alt="layer-icons"
                            src="/landing/layer-icons/layer6.svg"
                            className="absolute bottom-0 left-0 z-10"
                        />
                        <div className="lg:-mt-6 max-w-[700px] px-[25px] lg:pl-[63px] lg:pr-0 flex flex-col h-full justify-center">
                            <p className="text-[#241102] text-[24px] lg:text-[36px] font-semibold leading-[38px]">
                                Membership / Loyalty Module
                            </p>
                            <ul
                                style={{ listStyle: 'disc' }}
                                className="pl-5 mt-5 lg:mt-10 text-[#241102] text-[14px] lg:text-[18px] font-medium leading-[28px] lg:leading-[38px]"
                            >
                                <li>
                                    Increase repeat customers by 20–30% with
                                    easy-to-run loyalty programs.
                                </li>
                                <li>
                                    Boost guest spending by an average of 15%
                                    per visit through rewards and offers.
                                </li>
                            </ul>
                        </div>
                        <img
                            alt="layer-icons"
                            className="hidden lg:block h-[291px] self-end mr-3"
                            src="/landing/services/services3.svg"
                        />

                        <img
                            alt="layer-icons"
                            className="block lg:hidden h-[291px] self-end ml-11"
                            src="/landing/services/services5.svg"
                        />
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default NewProductAndServices;
