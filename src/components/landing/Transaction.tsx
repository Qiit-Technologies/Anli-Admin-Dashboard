'use client';
import { CheckIcon } from '@heroicons/react/16/solid';
import { useEffect } from 'react';
import AnimScroll from './AnimeScroll';

function Transaction() {
    const data = [
        {
            id: 1,
            title: 'In-Built Channel Manager',
            description:
                'Our In-Built Channel Manager Integrates with Major & Local OTAs',
        },
        {
            id: 2,
            title: 'Smart & Seemless Payment',
            description:
                'Safely Handle Payments across your business with security when offering Anli-Pay to your guests from any point of sale',
        },
        {
            id: 3,
            title: 'Reliable & Secure Solution',
            description:
                'One of the most reliable cloud services in the world with 99.99% uptime',
        },
    ];

    useEffect(() => {
        AnimScroll('.title2', 100, '.title2');
        AnimScroll('#list-0', 50, '.play-1');
        AnimScroll('#list-1', 50, '.play-2');
        AnimScroll('#list-2', 50, '.play-3');
        AnimScroll('.bg', 300, '#list-0');
        AnimScroll('#img-1', 30, '#list-0');
        AnimScroll('#img-2', 30, '#list-1');
        AnimScroll('#img-3', 30, '#list-2');
        AnimScroll('#img-4', 30, '#list-0');
        AnimScroll('#img-5', 30, '#list-1');
        AnimScroll('#img-6', 30, '.last');
    });

    return (
        <div className="w-full xl:w-container px-0 md:px-32 lg:px-12 xl:px-0 mx-auto overflow-hidden text-white flex flex-wrap lg:flex-nowrap justify-center xl:justify-between items-center gap-24">
            <div className="w-full lg:w-11/12">
                <h2 className="title2 text-3xl md:text-4xl text-center lg:text-left font-semibold leading-tight md:leading-relaxed mb-16">
                    Packed With Features
                </h2>
                {data.map((content, i) => {
                    return (
                        <div
                            id={'list-' + i}
                            key={i}
                            className="flex items-start gap-5 mt-8 mx-8 lg:mx-0"
                        >
                            <CheckIcon className="w-8 bg-midBlue text-white rounded-full p-2" />
                            <div className="">
                                <p className="text-xl font-medium">
                                    {content.title}
                                </p>
                                <p className="mt-2 text-base leading-loose text-slate-400 group-hover:text-white">
                                    {content.description}
                                </p>
                            </div>
                        </div>
                    );
                })}

                <div className="last"></div>
            </div>
            <div className="flex items-center gap-8 mx-10 xl:mx-0 xl:pr-20">
                <div className="flex flex-col items-start gap-7 z-10">
                    <img
                        id="img-1"
                        className="w-min"
                        src="/dash1.png"
                        alt="dash1"
                    />
                    <img
                        id="img-2"
                        className="play-1 w-min"
                        src="/dash2.png"
                        alt="dash2"
                    />
                    <img
                        id="img-3"
                        className="play-2 w-min"
                        src="/dash3.png"
                        alt="dash3"
                    />
                </div>
                <div className="flex flex-col items-start gap-7 z-10">
                    <img
                        id="img-4"
                        className="w-min"
                        src="/dash4.png"
                        alt="dash4"
                    />
                    <img
                        id="img-5"
                        className="w-min"
                        src="/dash5.png"
                        alt="dash5"
                    />
                    <img
                        id="img-6"
                        className="play-3 w-min"
                        src="/dash6.png"
                        alt="dash6"
                    />
                </div>
                <div className="bg hidden lg:block absolute w-[400px] h-[630px] bg-gradient rounded-2xl -mt-0 z-0 ml-44"></div>
            </div>
        </div>
    );
}

export default Transaction;
