from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CreateTask(BaseModel):
    task_name: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    assigned_to: str


class UpdateTask(BaseModel):
    task_name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    assigned_to:Optional[str] = None

class PublicTask(BaseModel):
    id: str
    task_name: str
    description: Optional[str]=None

    status: TaskStatus

    priority: TaskPriority

    owner_id: str

    assigned_to: Optional[str]=None

    created_at: datetime

    due_date: Optional[datetime]=None

    updated_at: Optional[datetime]=None

    is_deleted: bool


class UpdateTaskProgress(BaseModel):
    task_status:TaskStatus

class UpdateTaskPriority(BaseModel):
    task_priority:TaskPriority