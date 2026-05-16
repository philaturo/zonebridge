import { useEffect, useState, useCallback, useRef } from "react";

interface OnlineUser {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  cohort?: string;
  available?: boolean;
}

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const didConnectRef = useRef(false);

  const connect = useCallback(() => {
    if (didConnectRef.current) return;
    didConnectRef.current = true;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setConnected(true);
      console.log("[useOnlineUsers] WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const payload = data.payload || {};

        if (data.type === "USER_ONLINE") {
          setOnlineUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== payload.user_id);
            return [
              ...filtered,
              {
                id: payload.user_id,
                username: payload.username,
                display_name: payload.display_name,
                avatar_url: payload.avatar_url,
                cohort: payload.cohort,
                available: payload.available,
              },
            ];
          });
        } else if (data.type === "USER_OFFLINE") {
          setOnlineUsers((prev) =>
            prev.filter((u) => u.id !== payload.user_id),
          );
        }
      } catch (err) {
        console.error("[useOnlineUsers] Parse error:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      setTimeout(() => {
        didConnectRef.current = false;
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.error("[useOnlineUsers] WebSocket error:", err);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    didConnectRef.current = false;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { onlineUsers, connected };
}
