from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any

WEEKDAY_MAP = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}

DATE_MARKER_PATTERN = re.compile(
    r"\b("
    r"today|tomorrow|day after tomorrow|next week|next month|weekend|"
    r"next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"this\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"coming\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|"
    r"\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|"
    r"(?:january|february|march|april|may|june|july|august|september|october|november|december|"
    r"jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)"
    r")\b",
    flags=re.IGNORECASE,
)

MONTH_MAP = {
    "january": 1,
    "jan": 1,
    "february": 2,
    "feb": 2,
    "march": 3,
    "mar": 3,
    "april": 4,
    "apr": 4,
    "may": 5,
    "june": 6,
    "jun": 6,
    "july": 7,
    "jul": 7,
    "august": 8,
    "aug": 8,
    "september": 9,
    "sep": 9,
    "sept": 9,
    "october": 10,
    "oct": 10,
    "november": 11,
    "nov": 11,
    "december": 12,
    "dec": 12,
}


@dataclass
class ScheduledTask:
    title: str
    due_date: date
    reasoning: str


class TaskPlannerModel:
    """Lightweight local planner model that extracts task title + due date from prompt."""

    def plan_task(self, prompt: str, preferred_date: str | None = None) -> ScheduledTask:
        title = self._extract_title(prompt)
        due, reasoning = self._extract_date(prompt)

        if due is None and preferred_date:
            try:
                due = datetime.strptime(preferred_date, "%Y-%m-%d").date()
                reasoning = "Used your selected calendar date."
            except ValueError:
                due = None

        if due is None:
            due = date.today()
            reasoning = "No date was detected, so I scheduled it for today."

        return ScheduledTask(title=title, due_date=due, reasoning=reasoning)

    def plan_tasks(self, prompt: str, preferred_date: str | None = None) -> list[ScheduledTask]:
        chunks = self._split_multi_prompt(prompt)
        planned = [self.plan_task(chunk, preferred_date) for chunk in chunks if chunk.strip()]
        return planned or [self.plan_task(prompt, preferred_date)]

    def _split_multi_prompt(self, prompt: str) -> list[str]:
        cleaned = " ".join(prompt.strip().split())
        if not cleaned:
            return []

        # Split on clear separators first. Avoid splitting plain "and" to reduce false positives.
        chunks = re.split(r"(?:\s*;\s*|\s*\n+\s*|\s+and\s+also\s+|\s+also\s+|\s+then\s+)", cleaned, flags=re.IGNORECASE)
        normalized = [chunk.strip(" .,") for chunk in chunks if chunk.strip(" .,")]
        if len(normalized) > 1:
            return normalized

        # Split by plain "and" when multiple independent date intents are detected.
        if len(DATE_MARKER_PATTERN.findall(cleaned)) >= 2 and re.search(r"\s+and\s+", cleaned, flags=re.IGNORECASE):
            and_chunks = re.split(r"\s+and\s+", cleaned, flags=re.IGNORECASE)
            normalized_and = [chunk.strip(" .,") for chunk in and_chunks if chunk.strip(" .,")]
            if len(normalized_and) > 1:
                return normalized_and

        # If no explicit separators, split around repeated date intents like "on next ...".
        date_intent = re.compile(r"\b(?:on\s+)?(?:next\s+)?(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b", re.IGNORECASE)
        matches = list(date_intent.finditer(cleaned))
        if len(matches) <= 1:
            return [cleaned]

        segments: list[str] = []
        starts = [m.start() for m in matches]
        starts.append(len(cleaned))
        for idx in range(len(starts) - 1):
            segment = cleaned[starts[idx] : starts[idx + 1]].strip(" .,")
            if segment:
                segments.append(segment)

        return segments or [cleaned]

    def _extract_title(self, prompt: str) -> str:
        cleaned = " ".join(prompt.strip().split())

        for_clause = re.search(r"\bfor\s+(.+?)(?:\s+on\s+.+|\s+by\s+.+|$)", cleaned, flags=re.IGNORECASE)
        if for_clause:
            candidate = for_clause.group(1).strip(" .")
            if candidate:
                return candidate[0].upper() + candidate[1:]

        patterns = [
            r"(?:make|create|add|schedule)\s+(?:a\s+)?task\s+(?:to\s+)?(.+?)(?:\s+on\s+.+|\s+by\s+.+|\s+for\s+.+|$)",
            r"(?:please\s+)?(.+?)(?:\s+on\s+.+|\s+by\s+.+|\s+for\s+.+|$)",
        ]

        for pattern in patterns:
            match = re.search(pattern, cleaned, flags=re.IGNORECASE)
            if match:
                candidate = match.group(1).strip(" .")
                if candidate:
                    return candidate[0].upper() + candidate[1:]

        fallback = cleaned.strip(" .") or "Untitled task"
        return fallback[0].upper() + fallback[1:] if fallback else "Untitled task"

    def _extract_date(self, prompt: str) -> tuple[date | None, str]:
        lowered = prompt.lower()
        today = date.today()

        if "day after tomorrow" in lowered:
            return today + timedelta(days=2), "Detected 'day after tomorrow'."
        if "tomorrow" in lowered:
            return today + timedelta(days=1), "Detected 'tomorrow'."
        if "today" in lowered:
            return today, "Detected 'today'."
        if "next week" in lowered:
            return today + timedelta(days=7), "Detected 'next week'."
        if "next month" in lowered:
            tentative = today + timedelta(days=31)
            return tentative, "Detected 'next month'."
        if "weekend" in lowered:
            delta = (5 - today.weekday()) % 7
            return today + timedelta(days=delta), "Detected 'weekend' (scheduled for Saturday)."

        explicit_iso = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", lowered)
        if explicit_iso:
            try:
                parsed = datetime.strptime(explicit_iso.group(1), "%Y-%m-%d").date()
                return parsed, "Detected explicit YYYY-MM-DD date."
            except ValueError:
                pass

        numeric_date = re.search(r"\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b", lowered)
        if numeric_date:
            first = int(numeric_date.group(1))
            second = int(numeric_date.group(2))
            year_token = numeric_date.group(3)
            year = int(year_token) if year_token else today.year
            if year < 100:
                year += 2000

            # Prefer DD/MM parsing, unless it is impossible.
            day, month = first, second
            if second > 12 and first <= 12:
                day, month = second, first

            try:
                parsed = date(year, month, day)
                if not year_token and parsed < today:
                    parsed = date(year + 1, month, day)
                return parsed, "Detected numeric date phrase."
            except ValueError:
                pass

        long_date = re.search(
            r"\b(?:on\s+)?(\d{1,2})(?:st|nd|rd|th)?\s+"
            r"(january|february|march|april|may|june|july|august|september|october|november|december|"
            r"jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)(?:\s+(\d{4}))?\b",
            lowered,
        )
        if long_date:
            day = int(long_date.group(1))
            month_name = long_date.group(2).lower()
            year_token = long_date.group(3)
            year = int(year_token) if year_token else today.year
            try:
                month = MONTH_MAP[month_name]
                parsed = date(year, month, day)
                if not year_token and parsed < today:
                    parsed = date(year + 1, month, day)
                return parsed, "Detected calendar date phrase."
            except ValueError:
                pass

        month_first = re.search(
            r"\b(?:on\s+)?"
            r"(january|february|march|april|may|june|july|august|september|october|november|december|"
            r"jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+"
            r"(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b",
            lowered,
        )
        if month_first:
            month_name = month_first.group(1).lower()
            day = int(month_first.group(2))
            year_token = month_first.group(3)
            year = int(year_token) if year_token else today.year
            try:
                month = MONTH_MAP[month_name]
                parsed = date(year, month, day)
                if not year_token and parsed < today:
                    parsed = date(year + 1, month, day)
                return parsed, "Detected month-first date phrase."
            except ValueError:
                pass

        weekday_with_intent = re.search(
            r"\b(?:(next|this|coming)\s+)?"
            r"(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
            lowered,
        )
        if weekday_with_intent:
            qualifier = weekday_with_intent.group(1)
            weekday_name = weekday_with_intent.group(2)
            weekday_number = WEEKDAY_MAP[weekday_name]

            if qualifier in {"next", "coming"}:
                delta = (weekday_number - today.weekday()) % 7
                if delta == 0:
                    delta = 7
                return today + timedelta(days=delta), f"Detected '{qualifier} {weekday_name}'."

            if qualifier == "this":
                delta = (weekday_number - today.weekday()) % 7
                return today + timedelta(days=delta), f"Detected 'this {weekday_name}'."

        for weekday_name, weekday_number in WEEKDAY_MAP.items():
            if weekday_name in lowered:
                base = today
                delta = (weekday_number - base.weekday()) % 7
                if delta == 0:
                    delta = 7
                return base + timedelta(days=delta), f"Detected weekday '{weekday_name}'."

        return None, "No clear date was detected."

    def breakdown_task(self, task_text: str) -> list[dict[str, Any]]:
        cleaned = task_text.strip()
        if not cleaned:
            return []

        objective = self._extract_objective(cleaned)
        templates = self._breakdown_templates_for_text(cleaned)
        base_hash = abs(hash(cleaned)) % 10000

        return [
            {
                "id": f"sub-{idx + 1}-{base_hash}",
                "text": template.format(task=cleaned, objective=objective),
                "completed": False,
            }
            for idx, template in enumerate(templates)
        ]

    def _extract_objective(self, text: str) -> str:
        normalized = " ".join(text.split()).strip(" .")
        if not normalized:
            return "this task"

        stripped = re.sub(
            r"^(submit|create|write|draft|prepare|call|email|message|plan|organize|finish|complete)\s+",
            "",
            normalized,
            flags=re.IGNORECASE,
        ).strip()

        return stripped or normalized

    def _breakdown_templates_for_text(self, text: str) -> list[str]:
        lowered = text.lower()

        if any(word in lowered for word in ["call", "phone", "ring", "talk to", "speak with"]):
            return [
                "Define the goal of the call about {objective}",
                "Prepare 2-3 talking points and any details to confirm",
                "Make the call and capture key outcomes",
                "Send a short follow-up summary or next step",
            ]

        if any(word in lowered for word in ["report", "proposal", "essay", "document", "write", "draft"]):
            return [
                "Outline sections and expected outcome for {objective}",
                "Collect references, numbers, or source material",
                "Draft the first complete version",
                "Edit for clarity and submit the final version",
            ]

        if any(word in lowered for word in ["meeting", "presentation", "review", "demo"]):
            return [
                "Set agenda and success criteria for {objective}",
                "Prepare slides, talking points, or supporting notes",
                "Run the meeting/presentation and record decisions",
                "Share notes and assign follow-up actions",
            ]

        if any(word in lowered for word in ["code", "bug", "feature", "deploy", "api", "frontend", "backend"]):
            return [
                "Break {objective} into implementation steps",
                "Implement the core change in small commits",
                "Test key flows and edge cases",
                "Ship the change and monitor for issues",
            ]

        if any(word in lowered for word in ["study", "learn", "course", "practice", "exam", "read"]):
            return [
                "Choose the exact topic scope for {objective}",
                "Study or practice in one focused block",
                "Summarize what you learned in short notes",
                "Schedule a quick review session",
            ]

        return [
            "Define what done means for {objective}",
            "Prepare the inputs needed to start",
            "Complete the main execution block",
            "Review outcome and close with a clear next step",
        ]

    def orchestrate_tasks(self, tasks: list[dict[str, Any]], mood: str | None) -> dict[str, Any]:
        ranked = []
        for task in tasks:
            text = str(task.get("text", "")).strip()
            is_completed = bool(task.get("completed", False))
            urgency = 0.0 if is_completed else min(1.0, 0.35 + (len(text) / 120.0))
            ranked.append(
                {
                    "id": task.get("id"),
                    "text": text,
                    "completed": is_completed,
                    "priorityScore": round(urgency, 3),
                }
            )

        ranked.sort(key=lambda item: item["priorityScore"], reverse=True)

        ambient_theme = "fuchsia-500/30" if (mood or "").lower() == "focus" else "emerald-500/20"
        return {
            "priorityScores": ranked,
            "ambientTheme": ambient_theme,
        }
