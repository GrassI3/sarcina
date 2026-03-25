from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from core.realtime import realtime_manager

router = APIRouter(tags=["live"])


@router.websocket("/ws/live")
async def live_socket(websocket: WebSocket) -> None:
    await realtime_manager.connect(websocket)
    try:
        while True:
            # Keepalive/read loop. Any message from client is ignored.
            await websocket.receive_text()
    except WebSocketDisconnect:
        realtime_manager.disconnect(websocket)
    except Exception:
        realtime_manager.disconnect(websocket)
