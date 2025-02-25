from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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
        try:
            data = await websocket.receive_json()
        except WebSocketDisconnect:
            manager.remove(websocket)
            return
        except RuntimeError:
            manager.remove(websocket)
            return

        print(project, data)

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
            
            case "createNode":
                await manager.on_create_node(websocket, Node.model_validate(data))
            
            case "createRelationship":
                await manager.on_create_relationship(websocket, Relationship.model_validate(data))
            
            case "addChildren":
                await manager.on_add_children(websocket, AddChildren.model_validate(data))
            
            case "editNode":
                await manager.on_edit_node(websocket, Node.model_validate(data))
            
            case "editRelationship":
                await manager.on_edit_relationship(websocket, Relationship.model_validate(data))
            
            case "deleteNode":
                await manager.on_delete_node(websocket, data["id"])
            
            case "deleteRelationship":
                await manager.on_delete_relationship(websocket, data["id"])