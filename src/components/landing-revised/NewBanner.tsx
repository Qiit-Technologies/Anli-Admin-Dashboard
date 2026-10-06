import Section from './layout/Section';
import Image from 'next/image';

const Brands = [
    { path: '/landing/brands/logo1.png', width: 110, height: 70 },
    { path: '/landing/brands/logo2.png', width: 120, height: 67 },
    { path: '/landing/brands/logo3.png', width: 92, height: 85 },
    { path: '/landing/brands/logo4.png', width: 121, height: 68 },
];

const NewBanner = () => {
    return (
        <div className="w-full relative z-30 h-0">
            <Section
                bgClassName="w-full z-10 absolute -top-[100px]"
                className=""
            >
                <div className="px-4 lg:px-32 py-8 lg:py-12 rounded-3xl bg-[#FFF1DF] w-[80%] max-w-[925px] h-fit lg:h-[222px] mx-auto">
                    <p className="mx-auto max-w-[281px] lg:max-w-full text-[#002955] text-base font-semibold leading-5 tracking-[-0.32px] text-center">
                        Trusted by the best hospitality brands across the globe.
                    </p>
                    <div className="flex flex-wrap lg:flex-nowrap justify-center gap-x-8 lg:gap-[84px] gap-y-4 items-center mt-7 lg:mt-12">
                        {Brands.map((brand, index) => (
                            <Image
                                key={index}
                                src={brand.path || '/placeholder.svg'}
                                alt={`ANLI Solutions Trusted Brand ${index + 1}`}
                                width={brand.width}
                                height={brand.height}
                                loading="lazy"
                                className="object-contain"
                            />
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default NewBanner;
