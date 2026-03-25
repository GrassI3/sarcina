from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.realtime import realtime_manager
from core.store import read_store, write_store

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessageCreatePayload(BaseModel):
    author: str
    text: str


class ChatTaskCreatePayload(BaseModel):
    text: str
    tag: str = "General"
    assignee: str | None = "You"


class ChatTaskPatchPayload(BaseModel):
    text: str | None = None
    completed: bool | None = None
    tag: str | None = None
    assignee: str | None = None


@router.get("/messages")
def list_messages() -> list[dict]:
    store = read_store()
    return store["chat_messages"]


@router.post("/messages")
async def create_message(payload: ChatMessageCreatePayload) -> dict:
    store = read_store()
    message = {
        "id": str(uuid4()),
        "author": payload.author,
        "text": payload.text,
        "time": datetime.now().strftime("%I:%M %p"),
    }
    store["chat_messages"].append(message)
    write_store(store)
    await realtime_manager.broadcast("chat_message_created", message)
    return message


@router.delete("/messages/{message_id}")
async def delete_message(message_id: str) -> dict[str, str]:
    store = read_store()
    before = len(store["chat_messages"])
    store["chat_messages"] = [m for m in store["chat_messages"] if m["id"] != message_id]
    if len(store["chat_messages"]) == before:
        raise HTTPException(status_code=404, detail="Message not found")

    write_store(store)
    await realtime_manager.broadcast("chat_message_deleted", {"id": message_id})
    return {"status": "deleted"}


@router.get("/tasks")
def list_chat_tasks() -> list[dict]:
    store = read_store()
    return store["chat_tasks"]


@router.post("/tasks")
async def create_chat_task(payload: ChatTaskCreatePayload) -> dict:
    store = read_store()
    task = {
        "id": str(uuid4()),
        "text": payload.text,
        "completed": False,
        "tag": payload.tag,
        "assignee": payload.assignee,
        "updatedAt": datetime.utcnow().isoformat(),
    }
    store["chat_tasks"].append(task)
    write_store(store)
    await realtime_manager.broadcast("chat_task_created", task)
    return task


@router.patch("/tasks/{task_id}")
async def update_chat_task(task_id: str, payload: ChatTaskPatchPayload) -> dict:
    store = read_store()
    for task in store["chat_tasks"]:
        if task["id"] != task_id:
            continue

        if payload.text is not None:
            task["text"] = payload.text
        if payload.completed is not None:
            task["completed"] = payload.completed
        if payload.tag is not None:
            task["tag"] = payload.tag
        if payload.assignee is not None:
            task["assignee"] = payload.assignee

        task["updatedAt"] = datetime.utcnow().isoformat()
        write_store(store)
        await realtime_manager.broadcast("chat_task_updated", task)
        return task

    raise HTTPException(status_code=404, detail="Chat task not found")


@router.delete("/tasks/{task_id}")
async def delete_chat_task(task_id: str) -> dict[str, str]:
    store = read_store()
    before = len(store["chat_tasks"])
    store["chat_tasks"] = [task for task in store["chat_tasks"] if task["id"] != task_id]
    if len(store["chat_tasks"]) == before:
        raise HTTPException(status_code=404, detail="Chat task not found")

    write_store(store)
    await realtime_manager.broadcast("chat_task_deleted", {"id": task_id})
    return {"status": "deleted"}
