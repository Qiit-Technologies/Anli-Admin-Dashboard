'use client';

import { useRouter } from 'nextjs-toploader/app';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = () => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-gray-600 hover:bg-gray-400 hover:text-white transition-all shadow-lg"
        >
            <FaArrowLeft size={18} />
        </button>
    );
};

export default BackButton;
