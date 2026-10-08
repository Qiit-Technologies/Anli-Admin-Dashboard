import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import Logo from '../common/Logo';

const navLinks = [
    {
        title: 'About Us',
        href: '/about-us',
    },
    {
        title: 'Features',
        href: '/features',
    },
    {
        title: 'Blog',
        href: '/blog',
    },
    {
        title: 'FAQs',
        href: '/faqs',
    },
    {
        title: 'Help',
        href: '/help',
    },
    {
        title: 'Privacy',
        href: '/privacy',
    },
];

const socialLinks = [
    {
        icon: (
            <FaTwitter
                size={25}
                className="text-orion-blue transition-all hover:text-hexbrand hover:-translate-y-1"
            />
        ),
        href: 'https://x.com/weareanli',
    },
    {
        icon: (
            <FaLinkedin
                size={25}
                className="text-orion-blue transition-all hover:text-hexbrand hover:-translate-y-1"
            />
        ),
        href: 'https://www.linkedin.com/company/weareanli/',
    },
    {
        icon: (
            <FaInstagram
                size={25}
                className="text-orion-blue transition-all hover:text-hexbrand hover:-translate-y-1"
            />
        ),
        href: 'https://www.instagram.com/weareanli/',
    },
    {
        icon: (
            <FaFacebook
                size={25}
                className="text-orion-blue transition-all hover:text-hexbrand hover:-translate-y-1"
            />
        ),
        href: '#',
    },
];
const Footer = () => {
    return (
        <footer className="w-full relative bg-[#F9FAFB] px-4 lg:px-24 py-10 lg:py-20">
            <div className="flex flex-col gap-6 max-w-[1600px] mx-auto px-4">
                <div className="flex flex-col items-center lg:items-start gap-4">
                    <Logo />
                    <nav className="grid grid-cols-3 lg:grid-cols-6 gap-4">
                        {navLinks.map((link, index) => {
                            return (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-muted-foreground text-base"
                                >
                                    {link.title}
                                </a>
                            );
                        })}
                    </nav>
                    <hr className="mt-6 w-full" />
                </div>
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-0 items-center text-muted-foreground justify-between">
                    <div>
                        © {new Date().getFullYear()} AnIi solutions. All rights
                        reserved.
                    </div>
                    <div className="flex items-center gap-4">
                        {socialLinks.map((link, index) => {
                            return (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-muted-foreground text-base"
                                >
                                    {link.icon}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
