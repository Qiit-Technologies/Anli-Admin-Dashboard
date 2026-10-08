import Section from './layout/Section';

const Brands = [
    {
        path: '/landing/brands/logo1.png',
        width: '109.46px',
        height: '70.125px',
    },
    {
        path: '/landing/brands/logo2.png',
        width: '120px',
        height: '66.6px',
    },
    {
        path: '/landing/brands/logo3.png',
        width: '91.53px',
        height: '84.94px',
    },
    {
        path: '/landing/brands/logo4.png',
        width: '121px',
        height: '67.76px',
    },
];

const NewBanner = () => {
    return (
        <Section bgClassName="w-full" className="w-full">
            <div className="px-5 lg:px-32 pt-[67px] lg:pt-[43px] pb-[56px] lg:first-line:py-11 rounded-3xl bg-[#FFF1DF] w-[80%] max-w-[925px] h-fit lg:h-[222px] mx-auto">
                <p className="mx-auto max-w-[281px] lg:max-w-full text-[#002955] text-base font-semibold leading-5 tracking-[-0.32px] text-center">
                    Trusted by the best hospitality brands across the globe.
                </p>
                <div className="flex flex-wrap lg:flex-nowrap justify-center gap-x-8 lg:gap-[84px] gap-y-4 items-center mt-[27px] lg:mt-[52px]">
                    {Brands.map((brand, index) => (
                        <img
                            key={index}
                            style={{
                                width: brand.width,
                                height: brand.height,
                            }}
                            className={`lg:h-[${brand.height}] lg:w-[${brand.width}]`}
                            src={brand.path || '/placeholder.svg'}
                        />
                    ))}
                </div>
            </div>
        </Section>
    );
};

export default NewBanner;
