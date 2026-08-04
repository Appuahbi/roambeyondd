import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  return socket;
}

/*
Connects a realtime socket when the user is authenticated. The backend
authenticates via the httpOnly session cookie, so no token is stored in JS.
*/
export default function useSocket(onNotification, enabled = false) {
  const callbackRef = useRef(onNotification);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (!enabled) return;

    socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {});

    socket.on('notification:new', (notification) => {
      callbackRef.current?.(notification);
    });

    socket.on('connect_error', () => {});

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [enabled]);
}
