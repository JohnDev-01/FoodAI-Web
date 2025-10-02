import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SocketContextType } from '../types';
import { APP_CONFIG } from '../constants';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Inicializar socket solo en el cliente
    if (typeof window !== 'undefined') {
      const newSocket = io(APP_CONFIG.apiUrl, {
        transports: ['websocket'],
        autoConnect: false,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket conectado');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket desconectado');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión socket:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, []);

  const connect = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  const disconnect = () => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de SocketProvider');
  }
  return context;
}



