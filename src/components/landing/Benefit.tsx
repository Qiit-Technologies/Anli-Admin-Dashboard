'use client';
import { useEffect } from 'react';
import AnimScroll from './AnimeScroll';

function Analytics() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 bg-gradient rounded-lg p-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
            />
        </svg>
    );
}

function BankNotesIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 bg-gradient rounded-lg p-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
            />
        </svg>
    );
}

function ShoppingIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 bg-gradient rounded-lg p-4"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
            />
        </svg>
    );
}
function Benefit() {
    const data = [
        {
            id: 1,
            icon: <Analytics />,
            title: 'Revenue & Analytics',
            description:
                'Gain insights based on forward looking demand data for your market',
        },
        {
            id: 2,
            icon: <ShoppingIcon />,
            title: 'Distrubution & Marketing',
            description:
                'With our trusted distribution partners you can focus on your business operations',
        },
        {
            id: 3,
            icon: <BankNotesIcon />,
            title: 'Operation & Finance',
            description:
                "Leverage the most trusted pricing database to insure you're pricing competitively",
        },
    ];

    useEffect(() => {
        AnimScroll('.title', 100, '.title');
        AnimScroll('#card-0', 100, '.content');
        AnimScroll('#card-1', 150, '.content');
        AnimScroll('#card-2', 200, '.content');
    });

    return (
        <div className="xl:w-container mx-auto my-24 md:my-40 text-white">
            <div className="title x-full md:w-7/12 mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-semibold leading-relaxed">
                    The benefit you get
                </h2>
                <p className="mt-2 w-3/4 mx-auto text-slate-400 text-base">
                    Before you buy our Products you can see what benefits you
                    will get From buying our Financial Software
                </p>
            </div>
            <div className="card-list mt-16 text-center md:text-left flex flex-wrap justify-center gap-10">
                {data.map((content, i) => {
                    return (
                        <div
                            id={'card-' + i}
                            key={i}
                            className="group hover:bg-midBlue rounded-2xl hover:rounded-2xl transition duration-200 ease-out p-8 w-[360px]"
                        >
                            <span className="flex justify-center md:justify-start">
                                {content.icon}
                            </span>
                            <h3 className="mt-8 text-2xl font-medium">
                                {content.title}
                            </h3>
                            <p className="content  my-4 text-sm leading-loose text-slate-400 group-hover:text-white">
                                {content.description}
                            </p>
                            {/* <a className='font-medium underline' href="#">Read More</a> */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Benefit;
