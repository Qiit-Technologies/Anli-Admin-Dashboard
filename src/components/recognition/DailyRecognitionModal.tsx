'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRecognitions } from '@/app/actions/recognition';
import { useUser } from '@/context/useUser';
import { format } from 'date-fns';

export function DailyRecognitionModal() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [todaysRecognitions, setTodaysRecognitions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const checkForTodaysRecognitions = async () => {
        if (!user?.id) return;

        try {
            // Check if user has already seen today's recognitions
            const lastSeen = localStorage.getItem(
                `recognition_last_seen_${user.id}`,
            );
            const today = new Date().toDateString();

            if (lastSeen === today) {
                return; // Already seen today's recognitions
            }

            // Fetch all recognitions from today
            const result = await getRecognitions({ limit: 100 });
            const allRecognitions = result.data || [];

            // Filter recognitions from today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todaysRecs = allRecognitions.filter((rec: any) => {
                const recDate = new Date(rec.createdAt);
                return recDate >= todayStart;
            });

            // Filter recognitions relevant to this user
            const relevantRecognitions = todaysRecs.filter((rec: any) => {
                // Show public recognitions to everyone
                if (rec.isPublic) return true;
                // Show private recognitions only to the recipient
                if (!rec.isPublic && rec.recipientId === user.id) return true;
                return false;
            });

            if (relevantRecognitions.length > 0) {
                setTodaysRecognitions(relevantRecognitions);
                setOpen(true);
            } else {
                // Mark as seen even if no recognitions
                localStorage.setItem(`recognition_last_seen_${user.id}`, today);
            }
        } catch (error: any) {
            console.error('Failed to load daily recognitions:', error);
        }
    };

    const handleClose = () => {
        if (user?.id) {
            const today = new Date().toDateString();
            localStorage.setItem(`recognition_last_seen_${user.id}`, today);
        }
        setOpen(false);
    };

    const handleNext = () => {
        if (currentIndex < todaysRecognitions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleClose();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    if (todaysRecognitions.length === 0) return null;

    const currentRecognition = todaysRecognitions[currentIndex];
    const isForCurrentUser = currentRecognition.recipientId === user?.id;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg max-h-[85vh] p-0 flex flex-col overflow-hidden">
                {' '}
                {/* Confetti Animation - CSS */}
                <style>{`
                    @keyframes confetti-fall {
                        0% {
                            transform: translateY(-100%) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(600px) rotate(360deg);
                            opacity: 0;
                        }
                    }
                    @keyframes float {
                        0%,
                        100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-20px);
                        }
                    }
                    .confetti {
                        position: absolute;
                        width: 10px;
                        height: 10px;
                        animation: confetti-fall 3s ease-in infinite;
                    }
                    .float-animation {
                        animation: float 3s ease-in-out infinite;
                    }
                `}</style>
                {/* Confetti Elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: [
                                    '#FFD700',
                                    '#FF6B6B',
                                    '#4ECDC4',
                                    '#45B7D1',
                                    '#FFA07A',
                                ][i % 5],
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
                {/* Celebration Header */}
                <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 px-6 py-10 text-center overflow-hidden">
                    {/* Sparkle Elements */}
                    <div className="absolute top-4 left-4 text-2xl animate-pulse">
                        ✨
                    </div>
                    <div className="absolute top-6 right-6 text-3xl animate-bounce">
                        ⭐
                    </div>
                    <div className="absolute bottom-4 left-8 text-2xl animate-pulse delay-75">
                        💫
                    </div>
                    <div className="absolute bottom-6 right-4 text-xl animate-bounce delay-100">
                        🌟
                    </div>

                    <div className="relative z-10">
                        {/* Trophy/Medal Icon */}
                        <div className="mb-4 float-animation">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-2xl">
                                <span className="text-6xl">
                                    {isForCurrentUser ? '🏆' : '🎖️'}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                            {isForCurrentUser
                                ? "🎉 You're Amazing! 🎉"
                                : '👏 Recognition Time! 👏'}
                        </h2>
                        <p className="text-white/95 text-base font-medium">
                            {isForCurrentUser
                                ? "Your hard work didn't go unnoticed!"
                                : "Let's celebrate a team member!"}
                        </p>
                    </div>
                </div>
                {/* Recognition Content */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                    {/* Recipient Card with Celebration */}
                    <div className="relative">
                        <div className="absolute -top-3 -right-3 text-4xl animate-bounce z-10">
                            🎊
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-gradient-to-br from-white to-yellow-50 rounded-2xl border-2 border-yellow-200 shadow-lg">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl flex-shrink-0 ring-4 ring-yellow-100">
                                    {
                                        currentRecognition.recipient
                                            ?.firstName?.[0]
                                    }
                                    {
                                        currentRecognition.recipient
                                            ?.lastName?.[0]
                                    }
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                                    <span className="text-sm">⭐</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-xl truncate">
                                    {currentRecognition.recipient?.firstName}{' '}
                                    {currentRecognition.recipient?.lastName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 capitalize">
                                        {currentRecognition.type?.replace(
                                            /_/g,
                                            ' ',
                                        )}
                                    </Badge>
                                    {currentRecognition.points > 0 && (
                                        <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 font-bold">
                                            +{currentRecognition.points} pts
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message with Quote Styling */}
                    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200 shadow-md">
                        <div className="absolute -top-3 -left-3 text-4xl text-blue-400">
                            ❝
                        </div>
                        <p className="text-gray-700 leading-relaxed text-center italic text-base pt-4">
                            {currentRecognition.message}
                        </p>
                        <div className="absolute -bottom-3 -right-3 text-4xl text-blue-400">
                            ❞
                        </div>
                    </div>

                    {/* From Section */}
                    <div className="flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orion-blue to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                                {currentRecognition.givenBy?.firstName?.[0]}
                                {currentRecognition.givenBy?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Recognized by
                                </p>
                                <p className="font-bold text-gray-900">
                                    {currentRecognition.givenBy?.fullName}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-700">
                                {format(
                                    new Date(currentRecognition.createdAt),
                                    'MMM dd, yyyy',
                                )}
                            </p>
                            {!currentRecognition.isPublic && (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-end gap-1">
                                    🔒 Private
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="px-6 py-5 bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border-t-2 border-yellow-200 mt-auto">
                    {todaysRecognitions.length > 1 ? (
                        <div className="space-y-3">
                            {/* Dots Indicator */}
                            <div className="flex justify-center gap-2">
                                {todaysRecognitions.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-2.5 rounded-full transition-all ${
                                            idx === currentIndex
                                                ? 'bg-gradient-to-r from-orange-400 to-pink-500 w-10'
                                                : 'bg-gray-300 w-2.5 hover:bg-gray-400'
                                        }`}
                                        aria-label={`Go to recognition ${idx + 1}`}
                                    />
                                ))}
                            </div>
                            {/* Navigation Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-2 border-gray-300 hover:border-orion-blue"
                                >
                                    ← Previous
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-orion-blue to-blue-600 hover:from-orion-blue/90 hover:to-blue-600/90 text-white font-semibold shadow-md"
                                >
                                    {currentIndex <
                                    todaysRecognitions.length - 1
                                        ? 'Next Recognition →'
                                        : '🎊 Awesome! 🎊'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            onClick={handleClose}
                            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 hover:from-yellow-500 hover:via-orange-500 hover:to-pink-600 text-white font-bold text-lg py-6 shadow-lg"
                        >
                            🎉 Awesome! Let&apos;s Celebrate! 🎉
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
