from fastapi import FastAPI, WebSocket
import asyncio
from websocketManager import WebsocketManager, ProjectManager, Position, Node, Relationship, Move, AddChildren

app = FastAPI()
projectManager = ProjectManager()
manager = WebsocketManager(projectManager)

@app.get("/api/")
def test() -> str:
    return "Ok"

@app.websocket("/api/ws/{project:str}")
async def websocket(websocket: WebSocket, project: str):
    await manager.accept(websocket, project)

    while True:
        data = await websocket.receive_json()

        print(data)

        match data["type"]:
            case "moveNode":
                await manager.on_move_node(websocket, Move(
                    id=data["id"],
                    position=Position(
                        x=data["x"],
                        y=data["y"]
                    )
                ))
        
            case "moveRelationship":
                await manager.on_move_relationship(websocket, Move(
                    id=data["id"],
                    position=Position(
                        x=data["x"],
                        y=data["y"]
                    )
                ))