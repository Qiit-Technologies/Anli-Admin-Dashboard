'use client';

import { useEffect, useState } from 'react';

interface ReadingProgressProps {
    target?: string;
    className?: string;
}

export default function ReadingProgress({
    target = '.blog-content',
    className = '',
}: ReadingProgressProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const article = document.querySelector(target) as HTMLElement;
            if (!article) return;

            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;

            const articleBottom = articleTop + articleHeight;
            const windowBottom = scrollTop + windowHeight;

            if (scrollTop < articleTop) {
                setProgress(0);
            } else if (windowBottom > articleBottom) {
                setProgress(100);
            } else {
                const totalReadableHeight = articleHeight + windowHeight;
                const readHeight = scrollTop - articleTop + windowHeight;
                const progressPercentage =
                    (readHeight / totalReadableHeight) * 100;
                setProgress(Math.min(100, Math.max(0, progressPercentage)));
            }
        };

        window.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);
        updateProgress();

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
        };
    }, [target]);

    return (
        <>
            <div
                className={`fixed top-0 left-0 w-full h-1 bg-gray-200 z-50 ${className}`}
            >
                <div
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="fixed bottom-8 left-12 z-40">
                <div className="relative w-12 h-12">
                    <svg
                        className="w-12 h-12 transform -rotate-90"
                        viewBox="0 0 36 36"
                    >
                        <path
                            className="text-gray-200"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="transparent"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                            className="text-hexbrand"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${progress}, 100`}
                            strokeLinecap="round"
                            fill="transparent"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-hexbrand">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
