'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.scrollY > 100) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <Button
            variant="secondary"
            size="icon"
            className={cn(
                'fixed bottom-10 right-10 h-10 w-10 bg-hexbrand text-wrap rounded-full hover:bg-hexbrand shadow-md transition-opacity duration-300 z-50',
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
            onClick={scrollToTop}
            aria-label="Scroll to top"
        >
            <ChevronUp className="h-5 w-5 text-white" />
        </Button>
    );
}
