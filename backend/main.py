from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket("/api/{project:str}/ws")
async def websocket(ws: WebSocket, project: str):
    return ""