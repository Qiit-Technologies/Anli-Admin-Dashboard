import { Star } from 'lucide-react';
import { TestimonialCarousel } from './Carousel';
import Heading from './layout/Heading';
import Paragraph from './layout/Paragraph';
import Section from './layout/Section';

const testimonials = [
    {
        name: 'Sarah M',
        position: 'Regional Director, Luxe Stays',
        rating: 5,
        testimonial:
            'ANLI Solutions transformed our operations. We reduced check-in times by 50% and increased guest satisfaction scores significantly.',
    },
    {
        name: 'David L',
        position: 'General Manager, City View Hotels',
        rating: 4,
        testimonial:
            "Implementing ANLI's system improved our booking efficiency and streamlined our daily tasks. The team is very responsive and helpful.",
    },
    {
        name: 'Emily R',
        position: 'Owner, Boutique Retreats',
        rating: 5,
        testimonial:
            "ANLI's channel management tools have been a game-changer for us. We've seen a noticeable increase in bookings and revenue.",
    },
    {
        name: 'Michael K',
        position: 'Operations Manager, Coastal Resorts',
        rating: 4,
        testimonial:
            'The integration process was smooth, and we appreciate the ongoing support. ANLI Solutions has made a positive impact on our guest experience.',
    },
    {
        name: 'Jessica P',
        position: 'Front Desk Supervisor, Grand Hotels',
        rating: 5,
        testimonial:
            "ANLI's user-friendly interface has made training new staff a breeze. The automated features save us a lot of time and reduce errors.",
    },
    {
        name: 'Brian T',
        position: 'Revenue Manager, Mountain Lodges',
        rating: 4,
        testimonial:
            "The dynamic pricing tools have allowed us to optimize our rates and maximize occupancy. We're very happy with the results from ANLI.",
    },
];

const Testimonials = () => {
    return (
        <Section className="w-full lg:py-24 lg:px-0">
            <div className="w-full relative flex flex-col gap-5">
                <div className="flex flex-col items-center text-center gap-2">
                    <Heading>Testimonials</Heading>
                    <Paragraph className="line-clamp-2 font-normal no-underline">
                        Here is what our client are saying about our service.
                    </Paragraph>
                </div>
                <div className="mt-10 relative">
                    <TestimonialCarousel testimonials={testimonials} />
                    <Star className="w-4 h-4 absolute -top-10 right-60 fill-[#00425F] text-[#00425F]" />
                    <Star className="w-4 h-4 absolute  bottom-0 lg:-bottom-10 right-5 lg:left-60 fill-[#00425F] text-[#00425F]" />
                </div>
            </div>
        </Section>
    );
};

export default Testimonials;
