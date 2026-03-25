from datetime import date
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from core.ai_scheduler import TaskPlannerModel

router = APIRouter(prefix="/api/agent", tags=["agent"])
planner_model = TaskPlannerModel()


class TaskAgentRequest(BaseModel):
    prompt: str = Field(..., min_length=3)
    preferred_date: str | None = None


class PlannedTask(BaseModel):
    title: str
    due_date: date


class TaskAgentResponse(BaseModel):
    reply: str
    task: PlannedTask
    tasks: list[PlannedTask] = Field(default_factory=list)


class BreakdownTask(BaseModel):
    id: str | None = None
    text: str


class BreakdownRequest(BaseModel):
    task: BreakdownTask


class OrchestrateTask(BaseModel):
    id: str | None = None
    text: str
    completed: bool = False


class OrchestrateRequest(BaseModel):
    tasks: list[OrchestrateTask] = []
    planner: dict[str, Any] | None = None
    mood: str | None = None


@router.post("/new-task", response_model=TaskAgentResponse)
def create_task_from_prompt(payload: TaskAgentRequest) -> TaskAgentResponse:
    planned_items = planner_model.plan_tasks(payload.prompt, payload.preferred_date)
    serialized = [PlannedTask(title=item.title, due_date=item.due_date) for item in planned_items]
    first = serialized[0]

    if len(serialized) == 1:
        reply = (
            f"Planned task '{first.title}' for {first.due_date.isoformat()}. "
            f"{planned_items[0].reasoning}"
        )
    else:
        summary = ", ".join([f"'{task.title}' on {task.due_date.isoformat()}" for task in serialized[:4]])
        if len(serialized) > 4:
            summary = f"{summary}, and {len(serialized) - 4} more"
        reply = f"Planned {len(serialized)} tasks: {summary}."

    return TaskAgentResponse(
        reply=reply,
        task=first,
        tasks=serialized,
    )


@router.post("/breakdown")
def breakdown_task(payload: BreakdownRequest) -> dict[str, Any]:
    sub_tasks = planner_model.breakdown_task(payload.task.text)
    return {"subTasks": sub_tasks}


@router.post("/orchestrate")
def orchestrate_tasks(payload: OrchestrateRequest) -> dict[str, Any]:
    raw_tasks = [task.model_dump() for task in payload.tasks]
    orchestration = planner_model.orchestrate_tasks(raw_tasks, payload.mood)
    return {
        **orchestration,
        "hasPlanner": payload.planner is not None,
    }
