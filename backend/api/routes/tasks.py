from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.realtime import realtime_manager
from core.store import read_store, write_store

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


class SubTaskPayload(BaseModel):
    text: str
    completed: bool = False


class TaskCreatePayload(BaseModel):
    text: str
    dueDate: str | None = None


class TaskPatchPayload(BaseModel):
    text: str | None = None
    completed: bool | None = None
    dueDate: str | None = None
    subTasks: list[dict[str, Any]] | None = None


@router.get("")
def list_tasks() -> list[dict[str, Any]]:
    store = read_store()
    return store["tasks"]


@router.post("")
async def create_task(payload: TaskCreatePayload) -> dict[str, Any]:
    store = read_store()
    new_task = {
        "id": str(uuid4()),
        "text": payload.text.strip(),
        "completed": False,
        "subTasks": [],
        "dueDate": payload.dueDate,
        "updatedAt": datetime.utcnow().isoformat(),
    }
    store["tasks"].append(new_task)
    write_store(store)
    await realtime_manager.broadcast("task_created", new_task)
    return new_task


@router.patch("/{task_id}")
async def update_task(task_id: str, payload: TaskPatchPayload) -> dict[str, Any]:
    store = read_store()
    for task in store["tasks"]:
        if task["id"] != task_id:
            continue

        if payload.text is not None:
            task["text"] = payload.text.strip()
        if payload.completed is not None:
            task["completed"] = payload.completed
        if payload.dueDate is not None:
            task["dueDate"] = payload.dueDate
        if payload.subTasks is not None:
            task["subTasks"] = payload.subTasks
        task["updatedAt"] = datetime.utcnow().isoformat()

        write_store(store)
        await realtime_manager.broadcast("task_updated", task)
        return task

    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/{task_id}")
async def delete_task(task_id: str) -> dict[str, str]:
    store = read_store()
    before = len(store["tasks"])
    store["tasks"] = [task for task in store["tasks"] if task["id"] != task_id]
    if len(store["tasks"]) == before:
        raise HTTPException(status_code=404, detail="Task not found")

    write_store(store)
    await realtime_manager.broadcast("task_deleted", {"id": task_id})
    return {"status": "deleted"}


@router.post("/{task_id}/subtasks")
async def create_subtask(task_id: str, payload: SubTaskPayload) -> dict[str, Any]:
    store = read_store()
    for task in store["tasks"]:
        if task["id"] != task_id:
            continue

        subtask = {
            "id": str(uuid4()),
            "text": payload.text.strip(),
            "completed": payload.completed,
        }
        task.setdefault("subTasks", []).append(subtask)
        task["updatedAt"] = datetime.utcnow().isoformat()

        write_store(store)
        await realtime_manager.broadcast("task_updated", task)
        return subtask

    raise HTTPException(status_code=404, detail="Task not found")


@router.patch("/{task_id}/subtasks/{subtask_id}")
async def update_subtask(task_id: str, subtask_id: str, payload: SubTaskPayload) -> dict[str, Any]:
    store = read_store()
    for task in store["tasks"]:
        if task["id"] != task_id:
            continue

        for sub in task.setdefault("subTasks", []):
            if sub["id"] != subtask_id:
                continue

            sub["text"] = payload.text.strip()
            sub["completed"] = payload.completed
            task["updatedAt"] = datetime.utcnow().isoformat()
            write_store(store)
            await realtime_manager.broadcast("task_updated", task)
            return sub

        raise HTTPException(status_code=404, detail="Sub-task not found")

    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/{task_id}/subtasks/{subtask_id}")
async def delete_subtask(task_id: str, subtask_id: str) -> dict[str, str]:
    store = read_store()
    for task in store["tasks"]:
        if task["id"] != task_id:
            continue

        before = len(task.setdefault("subTasks", []))
        task["subTasks"] = [sub for sub in task["subTasks"] if sub["id"] != subtask_id]
        if len(task["subTasks"]) == before:
            raise HTTPException(status_code=404, detail="Sub-task not found")

        task["updatedAt"] = datetime.utcnow().isoformat()
        write_store(store)
        await realtime_manager.broadcast("task_updated", task)
        return {"status": "deleted"}

    raise HTTPException(status_code=404, detail="Task not found")
