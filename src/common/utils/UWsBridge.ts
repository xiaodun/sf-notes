import serviceConfig from "@/../service/app/config.json";

type TListener = (payload: any) => void;

const listenerMap = new Map<string, Map<string, TListener>>();
let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let isInited = false;

function getWsUrl() {
  const wsPort = serviceConfig.webSocket?.port;
  if (!wsPort) {
    return "";
  }
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = window.location.hostname;
  return `${protocol}://${host}:${wsPort}`;
}

function clearReconnectTimer() {
  if (reconnectTimer !== null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

function scheduleReconnect() {
  if (reconnectTimer !== null) {
    return;
  }
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 1500);
}

function dispatchPayload(payload: any) {
  const eventKey = String(payload?.key || payload?.type || "").trim();
  if (!eventKey) {
    return;
  }
  const listeners = listenerMap.get(eventKey);
  if (!listeners || !listeners.size) {
    return;
  }
  listeners.forEach((listener) => {
    listener(payload);
  });
}

function connect() {
  const wsUrl = getWsUrl();
  if (!wsUrl || ws) {
    return;
  }
  try {
    ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data || "{}");
        dispatchPayload(payload);
      } catch (error) {}
    };
    ws.onclose = () => {
      ws = null;
      scheduleReconnect();
    };
    ws.onerror = () => {
      ws?.close();
    };
  } catch (error) {
    ws = null;
    scheduleReconnect();
  }
}

namespace UWsBridge {
  export function init() {
    if (isInited) {
      return;
    }
    isInited = true;
    connect();
  }

  export function on(eventKey: string, listener: TListener) {
    const key = String(eventKey || "").trim();
    if (!key || typeof listener !== "function") {
      return () => {};
    }
    let listeners = listenerMap.get(key);
    if (!listeners) {
      listeners = new Map<string, TListener>();
      listenerMap.set(key, listeners);
    }
    const listenerId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    listeners.set(listenerId, listener);
    if (isInited) {
      connect();
    }
    return () => {
      const targetListeners = listenerMap.get(key);
      if (!targetListeners) {
        return;
      }
      targetListeners.delete(listenerId);
      if (!targetListeners.size) {
        listenerMap.delete(key);
      }
    };
  }

  export function close() {
    clearReconnectTimer();
    if (ws) {
      ws.close();
      ws = null;
    }
    isInited = false;
    listenerMap.clear();
  }
}

export default UWsBridge;
