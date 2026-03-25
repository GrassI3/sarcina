from __future__ import annotations

from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)

    async def broadcast(self, event_type: str, payload: Any) -> None:
        if not self._connections:
            return

        message = {"type": event_type, "payload": payload}
        stale: list[WebSocket] = []
        for socket in self._connections:
            try:
                await socket.send_json(message)
            except Exception:
                stale.append(socket)

        for socket in stale:
            self.disconnect(socket)


realtime_manager = ConnectionManager()
