from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any

STORE_PATH = Path(__file__).resolve().parents[1] / "data" / "store.json"

_DEFAULT_STORE: dict[str, Any] = {
    "tasks": [],
    "habits": [],
    "quick_note": {"id": "quick-note", "text": "", "savedAt": None},
    "chat_messages": [],
    "chat_tasks": [],
}

_lock = Lock()


def _ensure_store_file() -> None:
    STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not STORE_PATH.exists():
        STORE_PATH.write_text(json.dumps(_DEFAULT_STORE, indent=2), encoding="utf-8")


def read_store() -> dict[str, Any]:
    _ensure_store_file()
    with _lock:
        raw = STORE_PATH.read_text(encoding="utf-8")
        data = json.loads(raw)

    # Ensure schema keys exist even for older store files.
    for key, value in _DEFAULT_STORE.items():
        if key not in data:
            data[key] = value
    return data


def write_store(store: dict[str, Any]) -> dict[str, Any]:
    _ensure_store_file()
    with _lock:
        STORE_PATH.write_text(json.dumps(store, indent=2), encoding="utf-8")
    return store
