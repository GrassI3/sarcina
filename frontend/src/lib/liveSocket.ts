const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export type LiveEvent = {
  type: string;
  payload: unknown;
};

function toWsUrl(httpUrl: string): string {
  if (httpUrl.startsWith("https://")) {
    return httpUrl.replace("https://", "wss://");
  }
  return httpUrl.replace("http://", "ws://");
}

export function connectLiveSocket(onEvent: (event: LiveEvent) => void): () => void {
  let socket: WebSocket | null = null;
  let disposed = false;
  let reconnectTimer: number | null = null;

  const connect = () => {
    if (disposed) {
      return;
    }

    socket = new WebSocket(`${toWsUrl(BACKEND_BASE)}/ws/live`);

    socket.onmessage = (msg) => {
      try {
        const parsed = JSON.parse(msg.data) as LiveEvent;
        onEvent(parsed);
      } catch {
        // ignore malformed events
      }
    };

    socket.onclose = () => {
      if (disposed) {
        return;
      }
      reconnectTimer = window.setTimeout(connect, 1200);
    };
  };

  connect();

  return () => {
    disposed = true;
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}
