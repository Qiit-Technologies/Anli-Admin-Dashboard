'use client';
import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    role?: string;
    width?: number;
    height?: number;
}

const Logo = ({ role, width, height }: LogoProps) => {
    const redirectRules = () => {
        let pathname = '/';
        if (
            role === 'administrator' ||
            role === 'manager' ||
            role === 'general manager' ||
            role === 'supervisor'
        ) {
            pathname = '/admin';
        } else {
            pathname = '/';
        }
        return pathname;
    };
    return (
        <div
            className="flex items-center justify-center"
            style={{ width: width ?? 50, height: height ?? 50 }}
        >
            <Link href={redirectRules()} passHref legacyBehavior>
                <a>
                    <Image
                        width={width ?? 50}
                        height={height ?? 50}
                        src="/logos/anli-logo.png"
                        alt="Website logo"
                        priority
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                        }}
                    />
                </a>
            </Link>
        </div>
    );
};

export default Logo;
