'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import AnimScroll from './AnimeScroll';

function Banner() {
    useEffect(() => {
        AnimScroll('.anim-1', 150, '.anim-1');
        AnimScroll('.anim-2', 200, '.anim-1');
        AnimScroll('.anim-3', 250, '.anim-1');
    }, []);

    return (
        <div className="w-full xl:w-container px-4 md:px-8 lg:px-20 xl:px-0 mx-auto text-white text-center mt-16 xl:mt-28">
            <div className="w-full lg:w-4/6 mx-auto">
                <h1 className="anim-1 text-4xl md:text-5xl font-bold leading-tight md:leading-tight">
                    Turn Guest Experience Into Revenues
                </h1>
                <p className="anim-2 mt-5 text-base md:text-lg leading-normal md:leading-relaxed">
                    Anli Unifies The Solutions You need To Increase Total
                    Revenue, Streamline Operations And Improve Customer
                    Experience
                </p>
                <div className="anim-2 mt-7">
                    <Link href="/signup">
                        <button className="bg-btnDark text-white w-44 mx-3 h-16 font-medium rounded-lg hover:shadow-xl transition-all">
                            Request demo
                        </button>
                    </Link>
                    <Link href="/signin">
                        <button className="bg-btnLight text-blue w-44 mx-3 h-16 font-medium rounded-lg hover:shadow-xl transition-all">
                            Sign in
                        </button>
                    </Link>
                </div>
            </div>
            <img
                className="anim-3 mt-10 absolute left-0 right-0 md:relative md:mt-20 shadow-2xl "
                style={{ borderRadius: '2%' }}
                src="/dashboard.png"
                alt="software dashboard"
            />
        </div>
    );
}

export default Banner;
