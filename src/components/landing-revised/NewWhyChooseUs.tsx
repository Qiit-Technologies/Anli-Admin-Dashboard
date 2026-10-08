import NewSection from './layout/NewSection';
import Image from 'next/image';

const solutions = [
    {
        icon: '/landing/solutions/logo1.svg',
        title: 'Cloud-Based & Always Accessible',
        desc: 'Manage your hotel and restaurant from anywhere, anytime. Because it’s cloud-based, your data is secure, updated in real-time, and works even when you’re not on-site.',
        bg: '#F8FBFF',
    },

    {
        icon: '/landing/solutions/logo2.svg',
        title: 'Quick & Easy to Start',
        desc: 'Get your system up and running in just 2–3 days. We train your staff (online or in-person) and support you till everyone is comfortable using it.',
        bg: '#FEFFF8',
    },
    {
        icon: '/landing/solutions/logo3.svg',
        title: 'Pay in Local Currency',
        desc: 'No stress with dollar rates or hidden charges. You can pay directly in your local currency, simply and clearly.',
        bg: '#F8FFFD',
    },
    {
        icon: '/landing/solutions/logo4.svg',
        title: 'Support You Can Count On',
        desc: 'Anytime you need help, our local team is ready. We respond fast and fix issues quickly so your business doesn’t slow down.',
        bg: '#FFFCF8',
    },
];

const Data = [
    { title: '40+', desc: 'Integrations' },
    { title: '600%', desc: 'Return on investment' },
    { title: '4k+', desc: 'Global customers' },
];

const NewWhyChooseUs = () => {
    return (
        <NewSection
            bgClassName="relative pt-[225px] lg:pt-[100px]"
            bgChildren={
                <Image
                    src="/landing/layer-icons/layer1.svg"
                    alt="ANLI Solutions Layer 1"
                    width={100}
                    height={100}
                    className="absolute top-0 left-0 z-10"
                />
            }
            className="w-full"
        >
            <div className="mt-[102px]">
                <p className="text-[#101828] text-center text-[36px] lg:text-[64px] font-bold leading-[44px] tracking-[-0.72px] lg:tracking-[-1.28px]">
                    Why Choose Anli Solutions
                </p>
                <p className="text-[#667085] text-center text-[20px] font-normal leading-[30px] mt-5 mb-[84px]">
                    We make hotel and restaurant management simple with one easy
                    system.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[26px] gap-y-[26px] lg:gap-y-[46px]">
                    {solutions.map((solution) => (
                        <div
                            key={solution.title}
                            className={`cursor-pointer px-[39px] py-[30px] rounded-[60px] border border-[#E6DDD1] hover:border-[6px] hover:border-[#002955] bg-[${solution.bg}] flex flex-col items-stretch gap-[17px] transition-all duration-500 ease-in-out`}
                        >
                            <Image
                                src={solution.icon}
                                alt={`ANLI Solutions ${solution.title}`}
                                width={79}
                                height={79}
                                style={{
                                    width: 79,
                                    height: 79,
                                }}
                            />
                            <p className="text-[#101828] text-[20px] font-medium leading-[32px]">
                                {solution.title}
                            </p>
                            <p className="text-[#667085] text-[16px] font-normal leading-[24px]">
                                {solution.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-5 lg:px-32 pt-[67px] lg:pt-[43px] pb-[56px] lg:first-line:py-11 rounded-[24px] bg-[#000] w-full max-w-[1031px] h-fit lg:h-[298px] mx-auto mt-[87px] lg:mt-[75px] relative">
                <Image
                    src="/landing/layer-icons/layer2.svg"
                    alt="ANLI Solutions Layer 2"
                    width={100}
                    height={100}
                    className="absolute top-0 left-0 z-10"
                />
                <p className="text-[#E8ECF5] text-center text-[18px] font-semibold leading-[34px] tracking-[-0.36px]">
                    ANLI is not just another tool. It helps you serve guests
                    better, grow your revenue, and stay ahead of the
                    competition.
                </p>

                <div className="flex flex-col lg:flex-row justify-center gap-[30px] lg:gap-[84px] items-center mt-[32px]">
                    {Data.map((data, index) => (
                        <div
                            key={index}
                            className="flex gap-4 justify-center items-center h-full"
                        >
                            <div className="w-[234px] flex flex-col gap-3 justify-center items-center">
                                <p className="text-[#E8ECF5] text-[60px] font-semibold leading-[72px] tracking-[-1.2px]">
                                    {data.title}
                                </p>
                                <p className="text-[#E8ECF5] text-[18px] font-medium leading-[28px]">
                                    {data.desc}
                                </p>
                            </div>
                            <div className="hidden lg:block bg-[#EAECF0] h-[112px] w-[1px]" />
                        </div>
                    ))}
                </div>
            </div>
        </NewSection>
    );
};

export default NewWhyChooseUs;
