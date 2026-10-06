'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/useUser';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { MyFeedbackDialog } from '@/components/feedback/MyFeedbackDialog';

export function FeedbackButton() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { user } = useUser();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);
    const initialMousePosRef = useRef({ x: 0, y: 0 });

    // Load saved position from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('feedback-button-position');
            if (saved) {
                try {
                    const { x, y } = JSON.parse(saved);
                    setPosition({ x, y });
                } catch {
                    // Default position
                    setPosition({
                        x: window.innerWidth - 100,
                        y: window.innerHeight - 100,
                    });
                }
            } else {
                // Default to bottom-right
                setPosition({
                    x: window.innerWidth - 100,
                    y: window.innerHeight - 100,
                });
            }
        }
    }, []);

    // Update position on window resize
    useEffect(() => {
        const handleResize = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;
                setPosition((prev) => ({
                    x: Math.min(prev.x, maxX),
                    y: Math.min(prev.y, maxY),
                }));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left mouse button
        setIsDragging(true);
        setHasMoved(false); // Reset movement tracking
        initialMousePosRef.current = { x: e.clientX, y: e.clientY };
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
        e.preventDefault();
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;

            // Track if user has moved the mouse (dragged) - check if moved more than 5px
            if (!hasMoved) {
                const deltaX = Math.abs(
                    e.clientX - initialMousePosRef.current.x,
                );
                const deltaY = Math.abs(
                    e.clientY - initialMousePosRef.current.y,
                );
                if (deltaX > 5 || deltaY > 5) {
                    setHasMoved(true);
                }
            }

            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Constrain to viewport
            const maxX =
                window.innerWidth - (buttonRef.current?.offsetWidth || 100);
            const maxY =
                window.innerHeight - (buttonRef.current?.offsetHeight || 100);

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY)),
            });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                // Save position to localStorage
                if (buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    localStorage.setItem(
                        'feedback-button-position',
                        JSON.stringify({
                            x: rect.left,
                            y: rect.top,
                        }),
                    );
                }
                setIsDragging(false);
                // Reset hasMoved after a short delay to allow click handler to check it
                setTimeout(() => setHasMoved(false), 50);
            }
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = 'none'; // Prevent text selection while dragging
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
        };
    }, [isDragging, dragStart, hasMoved]);

    const handleClick = (e: React.MouseEvent) => {
        // Only open dialog if we didn't drag (moved the button)
        if (!hasMoved && !isDragging) {
            setDialogOpen(true);
        }
        e.preventDefault();
        e.stopPropagation();
    };

    if (!user) return null;

    return (
        <>
            <div
                ref={buttonRef}
                className="fixed z-50 flex flex-col items-end gap-3 cursor-move"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: 'none',
                }}
                onMouseDown={handleMouseDown}
            >
                <Button
                    onClick={handleClick}
                    className="rounded-full shadow-lg bg-orion-blue hover:bg-orion-blue/80 text-white px-6 py-6 select-none"
                    title="Click to open feedback • Drag to move"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">Feedback</span>
                </Button>
            </div>

            <MyFeedbackDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </>
    );
}
