'use client';
import { CheckIcon } from '@heroicons/react/16/solid';
import { useEffect } from 'react';
import AnimScroll from './AnimeScroll';

function Pricing() {
    const dataPrice = [
        {
            title: 'Beginner',
            price: 'Free',
            description:
                'Make your Plans easy by subscribing for free. Get it now',
            include: [
                'PMS',
                'Channel Manager',
                'Booking Engine',
                'Limited Rooms & Staff',
            ],
        },
        {
            title: 'Premium',
            price: '₦200,000',
            description:
                'This is the most popular Package here that is often purchase',
            include: [
                'Free Tier Included',
                'Payment Gateway',
                'OnBoarding Support',
                'Market Place Integration',
                'Up To 80 Rooms',
                'Chat support',
            ],
        },
        {
            title: 'Custom',
            price: 'On-Demand',
            description:
                'Limitless Possibilities. Build a comprehensive solution around Anli-PMS',
            include: [
                'All Premium Included',
                'Data Insights',
                'Unlimited Rooms & Staff',
                'Anomaly Detection',
                'Priority Support',
            ],
        },
    ];

    useEffect(() => {
        AnimScroll('.title3', 100, '.title3');
        AnimScroll('#price-0', 200, '.content2');
        AnimScroll('#price-1', 300, '.content2');
        AnimScroll('#price-2', 400, '.content2');
    });

    return (
        <div className="mt-28 lg:mt-52 w-full xl:w-container mx-auto px-4 md:px-10 xl:px-0 mb-10">
            <div className="title3 w-full lg:w-7/12 mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight md:leading-relaxed text-white">
                    The Right Pricing For Your Business
                </h2>
                <p className="mt-5 w-3/4 mx-auto text-slate-400 text-base">
                    EmPower your hotel with a comprehensive solution that
                    streamlines your operations and boost revenue
                </p>
            </div>
            <div className="flex flex-wrap xl:flex-nowrap justify-center gap-10 mt-16">
                {dataPrice.map((data, i) => {
                    return (
                        <div
                            id={'price-' + i}
                            key={i}
                            className="group hover:bg-midBlue text-white border hover:border-midBlue rounded-xl p-10 flex flex-col justify-between h-card"
                        >
                            <div className="">
                                <h3 className="md:text-3xl text-1x font-medium">
                                    {data.title}
                                </h3>
                                <p
                                    className="text-3xl mt-8 font-medium"
                                    style={{
                                        fontFamily: "'DM Sans', sans-serif",
                                    }}
                                >
                                    {data.price}{' '}
                                    <span className="text-base font-light">
                                        /Month
                                    </span>
                                </p>
                                <p className="content2 mt-5 md:text-base text-sm">
                                    {data.description}
                                </p>
                                {data.include.map((inc, k) => {
                                    return (
                                        <div
                                            key={k}
                                            className="flex items-start gap-5 mt-7 md:text-base text-sm"
                                        >
                                            <CheckIcon className="w-5 bg-white text-midBlue rounded-full p-1" />
                                            <p className="">{inc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="">
                                <button className="bg-midBlue group-hover:bg-white text-white group-hover:text-blue w-full h-16 font-medium rounded-lg hover:shadow-xl transition duration-200">
                                    Get started
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Pricing;
