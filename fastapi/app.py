import uuid
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import json

app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        new_id = str(uuid.uuid4())
        self.active_connections[new_id] = websocket
        return new_id

    async def disconnect(self, conn_id: str):
        await self.active_connections[conn_id].close()
        del self.active_connections[conn_id]

    async def send_personal_message(self, message: str, conn_id: str):
        await self.active_connections[conn_id].send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)


manager = ConnectionManager()


@app.get("/test")
async def read_main():
    return JSONResponse(content={"message": "Healthcheck Pass"})


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    conn_id = await manager.connect(websocket)
    await manager.send_personal_message(
        json.dumps({
            "type": "openSuccess",
            "id": conn_id
        }),
        conn_id
    )
    desktop_id = None
    
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)
            if data["type"] == "phoneIdentify":
                desktop_id = data["desktopId"]
                desktop_ws = manager.active_connections.get(desktop_id)
                if desktop_ws:
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "phoneConnected"
                        }),
                        desktop_id
                    )
            elif data["type"] == "imageSend":
                desktop_ws = manager.active_connections.get(desktop_id)
                if desktop_ws:
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "imageReceive",
                            "image": data["data"],
                        }),
                        desktop_id
                    )
    except WebSocketDisconnect:
        manager.disconnect(conn_id)