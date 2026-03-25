from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.chat import router as chat_router
from api.routes.habits import router as habits_router
from api.routes.live import router as live_router
from api.routes.meta import router as meta_router
from api.routes.notes import router as notes_router
from api.routes.task_agent import router as task_agent_router
from api.routes.tasks import router as tasks_router

app = FastAPI(title="FlowState Backend AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(task_agent_router)
app.include_router(meta_router)
app.include_router(tasks_router)
app.include_router(habits_router)
app.include_router(notes_router)
app.include_router(chat_router)
app.include_router(live_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
