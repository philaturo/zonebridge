import { useEffect, useState } from "react";
import type { Activity } from "../types";

// === MODULE-LEVEL SINGLETON ===
let globalWs: WebSocket | null = null;
let globalConnected = false;
const globalListeners: Set<(data: any) => void> = new Set();

function ensureConnection() {
  if (
    globalWs?.readyState === WebSocket.OPEN ||
    globalWs?.readyState === WebSocket.CONNECTING
  ) {
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

  ws.onopen = () => {
    globalConnected = true;
    console.log("[WebSocket] Connected");
    notifyListeners({ type: "_CONNECTED" });
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      notifyListeners(data);
    } catch (err) {
      console.error("[WebSocket] Parse error:", err);
    }
  };

  ws.onclose = () => {
    globalConnected = false;
    globalWs = null;
    notifyListeners({ type: "_DISCONNECTED" });
    setTimeout(ensureConnection, 3000);
  };

  ws.onerror = (err) => {
    console.error("[WebSocket] Error:", err);
  };

  globalWs = ws;
}

function notifyListeners(data: any) {
  globalListeners.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.error("[WebSocket] Listener error:", e);
    }
  });
}

// === useWebSocket hook (for Dashboard) ===
export function useWebSocket() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [connected, setConnected] = useState(globalConnected);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const listener = (data: any) => {
      if (data.type === "_CONNECTED") {
        setConnected(true);
      } else if (data.type === "_DISCONNECTED") {
        setConnected(false);
      } else if (data.type === "USER_ONLINE") {
        const userId = data.payload?.user_id || data.user_id;
        setOnlineUserIds((prev) => new Set(prev).add(userId));
        setActivities((prev) => [data, ...prev].slice(0, 50));
      } else if (data.type === "USER_OFFLINE") {
        const userId = data.payload?.user_id || data.user_id;
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        setActivities((prev) => [data, ...prev].slice(0, 50));
      } else {
        setActivities((prev) => [data, ...prev].slice(0, 50));
      }
    };

    globalListeners.add(listener);
    ensureConnection();

    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  return { activities, connected, onlineUserIds };
}

// === useOnlineUsers hook (for Layout + OnlineUsersSidebar) ===
export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [connected, setConnected] = useState(globalConnected);

  useEffect(() => {
    const listener = (data: any) => {
      if (data.type === "_CONNECTED") {
        setConnected(true);
      } else if (data.type === "_DISCONNECTED") {
        setConnected(false);
      } else if (data.type === "USER_ONLINE") {
        const payload = data.payload || {};
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
        const payload = data.payload || {};
        setOnlineUsers((prev) => prev.filter((u) => u.id !== payload.user_id));
      }
    };

    globalListeners.add(listener);
    ensureConnection();

    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  return { onlineUsers, connected };
}
