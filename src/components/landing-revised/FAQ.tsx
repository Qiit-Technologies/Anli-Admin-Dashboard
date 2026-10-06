'use client';

import { useRouter } from 'next/navigation';
import NewSection from './layout/NewSection';
import { Accordion, AccordionItem } from '@heroui/react';

const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
    >
        <path
            d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="#FF910C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const MinusIcon = () => (
    <svg
        className="rotate-90 "
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
    >
        <path
            d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="#FF910C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const Data = [
    {
        title: 'How fast can we set up the system?',
        desc: 'Most hotels and restaurants are live within 2–3 days. We handle onboarding, staff training, and give full support until you’re ready.',
    },
    {
        title: 'Can we pay in Naira or local currency?',
        desc: 'Yes. You don’t need to worry about dollar rates. Payments can be made in your local currency.',
    },
    {
        title: 'What if my staff are not tech-savvy?',
        desc: 'No problem. The system is simple and easy to use. Plus, we provide both online and in-person training until your team is confident',
    },

    {
        title: 'How reliable is customer support?',
        desc: 'We have a local support team in Nigeria that responds quickly. If any issue comes up, we fix it immediately so your business doesn’t slow down.',
    },
    {
        title: 'What happens if the internet connection is poor?',
        desc: 'Our system is cloud-based, but also designed to handle low internet situations. Your operations won’t stop if the network is slow.',
    },
    {
        title: 'Is this just for hotels, or restaurants too?',
        desc: 'It works for both and more. Whether you run a hotel, restaurant, resort, bar, or even manage events and banquets, our system brings everything together in one platform.',
    },
];

const FAQ = () => {
    const router = useRouter();

    return (
        <div className="w-full">
            <NewSection
                bgChildren={
                    <img
                        src="/landing/layer-icons/layer8.svg"
                        className="absolute bottom-0 left-0 z-10"
                    />
                }
                bgClassName="w-full relative"
                className="my-[72px]"
            >
                <div className="flex flex-col items-center gap-16">
                    <div className="text-center">
                        <p className="text-[#101828] text-[36px] lg:text-[48px] font-semibold leading-[51px] tracking-[-0.72px] lg:tracking-[-0.96px]">
                            Frequently asked questions
                        </p>
                        <p className="max-w-[317px] lg:max-w-full mx-auto mt-5 text-[#667085] text-[16px] lg:text-[20px] font-normal leading-[30px] tracking-normal">
                            Everything you need to know about the product and
                            billing.
                        </p>
                    </div>

                    <div className="mx-auto w-full max-w-[768px]">
                        <Accordion className="w-full">
                            {Data.map((data, index) => (
                                <AccordionItem
                                    key={index}
                                    aria-label={`Accordion ${index}`}
                                    title={data.title}
                                    indicator={({ isOpen }) =>
                                        isOpen ? <MinusIcon /> : <PlusIcon />
                                    }
                                    className="text-[#101828] text-[18px] font-medium leading-[28px] my-[8px]"
                                >
                                    <p className="text-[#667085] text-[16px] font-normal leading-[24px]">
                                        {data.desc}
                                    </p>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>

                    <div className="flex flex-col items-center gap-8 p-8 rounded-2xl bg-[#F9FAFB] max-w-[1216px] w-full relative z-20">
                        <img
                            src="/landing/questions.png"
                            className="w-[120px]"
                        />
                        <div className="text-center">
                            <p className="text-[#101828] text-[20px] font-medium leading-[30px]">
                                Still have questions?
                            </p>
                            <p className="text-[#667085] text-[18px] font-normal leading-[28px]">
                                Can’t find the answer you’re looking for? Please
                                chat to our friendly team.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/get-a-demo')}
                            className="text-[#FFF] text-[16px] font-normal leading-[24px] rounded-lg border border-[#FF910C] bg-[#FF910C] shadow-sm px-[18px] py-[10px]"
                        >
                            Get in touch
                        </button>
                    </div>
                </div>
            </NewSection>
        </div>
    );
};

export default FAQ;
