from datetime import datetime

from fastapi import APIRouter

router = APIRouter(prefix="/api/meta", tags=["meta"])

MORNING_QUOTES = [
    "Win the morning and the day follows.",
    "Small starts beat perfect plans.",
    "Begin with one clear move.",
]
AFTERNOON_QUOTES = [
    "Protect your peak hours for meaningful work.",
    "Progress compounds in focused blocks.",
    "Finish the hard thing first.",
]
EVENING_QUOTES = [
    "Review, reset, and leave a better tomorrow.",
    "Done today is momentum tomorrow.",
    "Close loops before you close the day.",
]


def _quote_pool(hour: int) -> list[str]:
    if hour < 12:
        return MORNING_QUOTES
    if hour < 18:
        return AFTERNOON_QUOTES
    return EVENING_QUOTES


@router.get("/quote")
def quote_of_moment() -> dict[str, str]:
    now = datetime.now()
    pool = _quote_pool(now.hour)
    # Rotates every minute based on current local time.
    index = (now.hour * 60 + now.minute) % len(pool)
    return {
        "quote": pool[index],
        "period": "morning" if now.hour < 12 else "afternoon" if now.hour < 18 else "evening",
        "generatedAt": now.isoformat(),
    }
