'use client';
import React, { useEffect } from 'react';
import AnimScroll from './AnimeScroll';

function Company() {
    useEffect(() => {
        AnimScroll('.anim1', 100, '.anim1');
        AnimScroll('.anim2', 80, '.anim1');
    });

    return (
        <div className="anim1 mt-60 sm:mt-64 md:mt-36 lg:mt-72 xl:mt-72 px-8 md:px-24 xl:px-0 w-full xl:w-container mx-auto text-white">
            <h2 className="text-center text-3xl md:text-4xl font-semibold w-full lg:w-7/12 mx-auto leading-tight md:leading-relaxed">
                Trusted By Industry Leaders
            </h2>
            <div className="anim2 flex justify-between items-center mt-8 md:mt-16">
                <img
                    className="w-16 md:w-36"
                    src="/airbnb.png"
                    alt="airbnb logo"
                />
                <img
                    className="w-16 md:w-36"
                    src="/bookingcom.png"
                    alt="booking logo"
                />
                <img
                    className="w-16 md:w-36"
                    src="/expedia.png"
                    alt="expedia logo"
                />
                <img
                    className="w-16 md:w-36"
                    src="/trivago.png"
                    alt="trivago logo"
                />
            </div>
        </div>
    );
}

export default Company;
