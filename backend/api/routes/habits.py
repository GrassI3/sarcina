from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.store import read_store, write_store

router = APIRouter(prefix="/api/habits", tags=["habits"])


class HabitCreatePayload(BaseModel):
    name: str


class HabitPatchPayload(BaseModel):
    name: str | None = None
    streak: int | None = None
    lastCompletedDate: str | None = None


@router.get("")
def list_habits() -> list[dict]:
    store = read_store()
    return store["habits"]


@router.post("")
def create_habit(payload: HabitCreatePayload) -> dict:
    store = read_store()
    habit = {
        "id": str(uuid4()),
        "name": payload.name.strip(),
        "streak": 0,
        "lastCompletedDate": None,
        "updatedAt": datetime.utcnow().isoformat(),
    }
    store["habits"].append(habit)
    write_store(store)
    return habit


@router.patch("/{habit_id}")
def update_habit(habit_id: str, payload: HabitPatchPayload) -> dict:
    store = read_store()
    for habit in store["habits"]:
        if habit["id"] != habit_id:
            continue

        if payload.name is not None:
            habit["name"] = payload.name.strip()
        if payload.streak is not None:
            habit["streak"] = payload.streak
        if payload.lastCompletedDate is not None:
            habit["lastCompletedDate"] = payload.lastCompletedDate
        habit["updatedAt"] = datetime.utcnow().isoformat()

        write_store(store)
        return habit

    raise HTTPException(status_code=404, detail="Habit not found")


@router.delete("/{habit_id}")
def delete_habit(habit_id: str) -> dict[str, str]:
    store = read_store()
    before = len(store["habits"])
    store["habits"] = [habit for habit in store["habits"] if habit["id"] != habit_id]
    if len(store["habits"]) == before:
        raise HTTPException(status_code=404, detail="Habit not found")

    write_store(store)
    return {"status": "deleted"}
