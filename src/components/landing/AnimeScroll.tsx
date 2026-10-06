import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

function AnimScroll(clas: string, props: number, scroll: string) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(clas, {
        y: props,
        duration: 1,
        opacity: 0,
        scrollTrigger: scroll,
        ease: 'power0.easeOut',
    });
}

export default AnimScroll;
