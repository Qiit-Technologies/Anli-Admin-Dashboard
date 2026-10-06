import Logo from '../common/Logo';

export default function HomeClientLoader() {
    return (
        <div className="flex bg-[#FFF8F2] items-center justify-center w-full h-screen">
            <div className="flex flex-col items-center">
                <div className="animate-pulse">
                    <Logo width={60} height={60} />
                </div>
            </div>
        </div>
    );
}
