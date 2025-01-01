from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime

from pydantic import BaseModel

class Position(BaseModel):
    x: float
    y: float

class Node(BaseModel):
    first_name: str
    last_name: str
    birth: Optional[datetime]
    death: Optional[datetime]
    id: int

class Relationship(BaseModel):
    start: Optional[datetime]
    end: Optional[datetime]
    type: str
    nodes: List[int]
    id: int

class Move(BaseModel):
    id: int
    position: Position

class AddChildren(BaseModel):
    relationshipId: int
    child: int

class InitialProjectData(BaseModel):
    nodes: List
    relationships: List

class TypedData(BaseModel):
    type: str
    data: Any

class ProjectManager:
    def has_access(self, ws: WebSocket, project: str) -> bool:
        return True
    
    def project_exists(self, project: str) -> bool:
        return True
    
    def get_current_project_data(self, project: str) -> InitialProjectData:
        return InitialProjectData(
            nodes=["a"],
            relationships=["b"]
        )


class WebsocketManager:
    def __init__(self, projectManager: ProjectManager):
        self.sockets: Dict[str, List[WebSocket]] = {}
        self.projectManager: ProjectManager = projectManager

    async def accept(self, ws: WebSocket, project: str):
        await ws.accept()
        if not self.projectManager.project_exists(project):
            await self.close_error(ws, "invalid project")
        
        if not self.projectManager.has_access(ws, project):
            await self.close_error(ws, "invalid project")
        
        await self.send(ws, self.projectManager.get_current_project_data(project))

        if project not in self.sockets:
            self.sockets[project] = []
        
        self.sockets[project].append(ws)
    
    async def on_move_node(self, origin: WebSocket, data: Move):
        await self.send_to_all(origin, TypedData(
            type="moveNode",
            data=data
            ))

    async def on_move_relationship(self, origin: WebSocket, data: Move):
        await self.send_to_all(origin, TypedData(
            type="moveRelationship",
            data=data
            ))

    async def on_create_node(self, origin: WebSocket, node: Node):
        pass

    async def on_create_relationship(self, origin: WebSocket, relationship: Relationship):
        pass

    async def on_add_children(self, origin: WebSocket, data: AddChildren):
        pass

    async def on_edit_node(self, origin: WebSocket, node: Node):
        pass

    async def on_edit_relationship(self, origin: WebSocket, relationship: Relationship):
        pass

    async def send_to_all(self, origin: WebSocket, data: Any):
        for ws in self.sockets[self.get_project(origin)]:
            if ws is origin:
                continue
            await self.send(ws, data)

    async def close_error(self, ws: WebSocket, message: str):
        await ws.send_text(f"error {message}")
        await ws.close(reason=message)

        self.remove(ws)
    
    def remove(self, ws: WebSocket):
        for k,v in self.sockets.items():
            if ws in v:
                v.remove(ws)
    
    async def send(self, ws: WebSocket, data: Any):
        if isinstance(data, BaseModel):
            data = data.model_dump_json()
        try:
            await ws.send_text(data)
        except WebSocketDisconnect:
            self.remove(ws)
        except RuntimeError:
            self.remove(ws)
    
    def get_project(self, ws: WebSocket) -> Optional[str]:
        for k,v in self.sockets.items():
            if ws in v:
                return k