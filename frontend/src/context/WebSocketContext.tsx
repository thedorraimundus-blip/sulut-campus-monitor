import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  latestArticle: any;
  liveArticles: any[];
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  latestArticle: null,
  liveArticles: [],
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestArticle, setLatestArticle] = useState<any>(null);
  const [liveArticles, setLiveArticles] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_ARTICLE') {
              setLatestArticle(data.data);
              setLiveArticles((prev) => [data.data, ...prev.slice(0, 19)]);
            }
          } catch (err) {
            // non-json or ping
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Try reconnect in 4 seconds
          setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (e) {
        setIsConnected(false);
      }
    };

    connect();

    // Heartbeat ping
    const interval = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, latestArticle, liveArticles }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
