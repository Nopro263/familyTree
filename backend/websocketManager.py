from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Optional, Any, Literal
from datetime import datetime

from pydantic import BaseModel

from typing import TypeVar, Generic

T = TypeVar('T')

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
    rtype: str
    nodes: List[int]
    id: int
    children: Optional[List[int]] = None

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

class Positioned(Generic[T]):
    def __init__(self, position: Position, data: T):
        self.position = position
        self.data = data

class Project:
    def __init__(self):
        self.nodes: List[Positioned[Node]] = []
        self.relationships: List[Positioned[Relationship]] = []
    
    def get_node(self, id: int) -> Positioned[Node]:
        for n in self.nodes:
            if n.data.id == id:
                return n
    
    def get_relationship(self, id: int) -> Positioned[Relationship]:
        for n in self.relationships:
            if n.data.id == id:
                return n

    def get_current_data(self) -> list:
        actions = []
        for n in self.nodes:
            actions.append(TypedData(type="createNode",data=n.data))
        
        for n in self.nodes:
            actions.append(TypedData(type="moveNode",data=Move(id=n.data.id, position=n.position)))
        
        for n in self.relationships:
            actions.append(TypedData(type="createRelationship",data=n.data))
        
        for n in self.relationships:
            actions.append(TypedData(type="moveRelationship",data=Move(id=n.data.id, position=n.position)))

        return actions
    
    def move_node(self, move: Move):
        node = self.get_node(move.id)
        node.position = move.position

    def move_relationship(self, move: Move):
        node = self.get_relationship(move.id)
        node.position = move.position
    
    def create_node(self, node: Node):
        self.nodes.append(Positioned[Node](Position(x=0,y=0), node))
    
    def create_relationship(self, relationship: Relationship):
        pos = self._middle(self.get_node(relationship.nodes[0]).position, 
                           self.get_node(relationship.nodes[1]).position)
        
        self.relationships.append(Positioned[Relationship](pos, relationship))
    
    def add_children(self, data: AddChildren):
        r = self.get_relationship(data.relationshipId).data
        if not r.children:
            r.children = []
        r.children.append(data.child)
    
    def _middle(self, p1: Position, p2: Position) -> Position:
        x = (p1.x + p2.x) / 2
        y = (p1.y + p2.y) / 2 # TODO not a perfect match for positioning
        print(x,y)
        return Position(x=x, y=y)

class ProjectManager:
    def __init__(self):
        self.projects: Dict[str, Project] = {}

    def has_access(self, ws: WebSocket, project: str) -> bool:
        return True
    
    def project_exists(self, project: str) -> bool:
        if project not in self.projects:
            self.projects[project] = Project()
        return True
    
    def get_current_project_data(self, project: str) -> list:
        return self.projects[project].get_current_data()
    
    def on_move_node(self, project: str, data: Move):
        self.projects[project].move_node(data)

    def on_move_relationship(self, project: str, data: Move):
        self.projects[project].move_relationship(data)
    
    def on_create_node(self, project: str, node: Node):
        self.projects[project].create_node(node)
    
    def on_create_relationship(self, project: str, node: Node):
        self.projects[project].create_relationship(node)
    
    def on_add_children(self, project: str, data: AddChildren):
        self.projects[project].add_children(data)


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
        
        await self.send_all(ws, self.projectManager.get_current_project_data(project))

        if project not in self.sockets:
            self.sockets[project] = []
        
        self.sockets[project].append(ws)
    
    async def on_move_node(self, origin: WebSocket, data: Move):
        self.projectManager.on_move_node(self.get_project(origin), data)
        await self.send_to_all(origin, TypedData(
            type="moveNode",
            data=data
            ))

    async def on_move_relationship(self, origin: WebSocket, data: Move):
        self.projectManager.on_move_relationship(self.get_project(origin), data)
        await self.send_to_all(origin, TypedData(
            type="moveRelationship",
            data=data
            ))

    async def on_create_node(self, origin: WebSocket, node: Node):
        self.projectManager.on_create_node(self.get_project(origin), node)
        await self.send_to_all(origin, TypedData(
            type="createNode",
            data=node
            ))

    async def on_create_relationship(self, origin: WebSocket, relationship: Relationship):
        self.projectManager.on_create_relationship(self.get_project(origin), relationship)
        await self.send_to_all(origin, TypedData(
            type="createRelationship",
            data=relationship
            ))

    async def on_add_children(self, origin: WebSocket, data: AddChildren):
        self.projectManager.on_add_children(self.get_project(origin), data)
        await self.send_to_all(origin, TypedData(
            type="addChildren",
            data=data
            ))

    async def on_edit_node(self, origin: WebSocket, node: Node):
        pass

    async def on_edit_relationship(self, origin: WebSocket, relationship: Relationship):
        pass

    async def send_to_all(self, origin: WebSocket, data: Any):
        for ws in self.sockets[self.get_project(origin)]:
            if ws is origin:
                continue
            await self.send(ws, data)
    
    async def send_all(self, ws: WebSocket, data: list):
        for d in data:
            await self.send(ws, d)

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