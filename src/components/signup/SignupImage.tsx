import Image from 'next/image';
import { useEffect, useState } from 'react';
import image1 from '../../app/assets/sign-image.svg';
import image2 from '../../app/assets/sign-image.svg';
// import image2 from '../assets/sign-image-2.svg';

export default function SignupImage() {
    const images = [image1, image2];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(
                (prevIndex) => (prevIndex + 1) % images.length,
            );
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="hidden lg:flex overflow-hidden w-full h-full relative">
            {images.map((img, index) => (
                <Image
                    key={index}
                    width={500}
                    height={500}
                    priority={index === 0}
                    className={`absolute top-0 left-0 object-cover object-left-bottom w-full h-full transition-opacity duration-1000 ${
                        index === currentImageIndex
                            ? 'opacity-100'
                            : 'opacity-0'
                    }`}
                    src={img}
                    alt={`Signup visual ${index + 1}`}
                />
            ))}
        </div>
    );
}
