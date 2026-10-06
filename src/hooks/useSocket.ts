'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '@/constants/api';

export const useSocket = (
    eventHandler?: (event: string, data: any) => void,
) => {
    const socketRef = useRef<Socket | null>(null);
    const handlerRef = useRef(eventHandler);

    useEffect(() => {
        handlerRef.current = eventHandler;
    }, [eventHandler]);

    useEffect(() => {
        const socket = io(BASE_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        socket.on('work-period-update', (data) => {
            handlerRef.current?.('work-period-update', data);
        });

        return () => {
            if (socket.connected) {
                socket.disconnect();
            }
            socketRef.current = null;
        };
    }, []);

    return socketRef.current;
};
