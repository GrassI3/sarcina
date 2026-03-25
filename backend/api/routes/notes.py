from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from core.store import read_store, write_store

router = APIRouter(prefix="/api/notes", tags=["notes"])


class QuickNotePayload(BaseModel):
    text: str


@router.get("/quick")
def get_quick_note() -> dict:
    store = read_store()
    return store["quick_note"]


@router.put("/quick")
def save_quick_note(payload: QuickNotePayload) -> dict:
    store = read_store()
    note = {
        "id": "quick-note",
        "text": payload.text,
        "savedAt": datetime.utcnow().isoformat(),
    }
    store["quick_note"] = note
    write_store(store)
    return note
