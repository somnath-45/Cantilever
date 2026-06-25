from fastapi import (
    APIRouter,
    Depends,
    Query,
    status
)

from typing import Annotated,Optional
from datetime import datetime

from Core.auth import check_roles,Roles
from Core.db import get_db
from Tasks.schema import (
    PublicTask,
    CreateTask,
    UpdateTask,
    TaskStatus,
    TaskPriority
)

from Tasks import service


router = APIRouter()


@router.get(
    "/by_id/{task_id}",
    response_model=PublicTask
)
async def get_task_by_id(
    task_id: str,
    db=Depends(get_db),
    current_user = Depends(check_roles([Roles.MANAGER,Roles.CONTRIBUTOR]))
):
    return await service.get_task_by_id(
        task_id,
        db,
        current_user
    )


@router.get(
    "/by_name/{task_name}",
    response_model=PublicTask
)
async def get_task_by_name(
    task_name: str,
    db=Depends(get_db),
    current_user = Depends(check_roles([Roles.MANAGER,Roles.CONTRIBUTOR]))
):
    return await service.get_task_by_name(
        task_name,
        db,
        current_user
    )


@router.post(
    "/add_task",
    response_model=PublicTask,
    status_code=status.HTTP_201_CREATED
)
async def create_task(
    task_data: CreateTask,
    db=Depends(get_db),
    current_user=Depends(check_roles([Roles.MANAGER])),
    
):
    return await service.create_task(
        task_data,
        current_user["_id"],
        db,
        current_user
    )


@router.get(
    "/all_tasks",
    response_model=list[PublicTask]
)
async def get_all_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(
        10,
        ge=1,
        le=100
    ),
    db=Depends(get_db),
    current_user = Depends(check_roles([Roles.MANAGER,Roles.CONTRIBUTOR]))
):
    return await service.get_all_tasks(
        db,
        skip,
        limit,
        current_user
    )

@router.get(
        "/assigned_to/{user_name}",
        response_model=list[PublicTask]
        )
async def get_task_assigned_to(
    user_name:str,
    db=Depends(get_db),
    skip:int=Query(0,ge=0),
    limit:int=Query(10,ge=1,le=50),
    current_user=Depends(check_roles([Roles.MANAGER])),
    ):
    return await service.get_task_assigned_to(user_name,db,skip,limit)

@router.get("/filter_task",response_model=list[PublicTask])
async def filter_task(
    db=Depends(get_db),
    skip:int=Query(0,ge=0),
    limit:int=Query(10,ge=1,le=50),
    deadline:Optional[datetime]=Query(None),
    priority:Optional[str]=Query(None),
    task_status:Optional[str]=Query(None),
    current_user=Depends(check_roles([Roles.MANAGER,Roles.CONTRIBUTOR]))
    ):
    return await service.filter_task(db,skip,limit,deadline,priority,task_status,current_user)

@router.patch(
    "/update_task/{task_id}",
    response_model=PublicTask
)
async def update_task(
    task_id: str,
    task_data: UpdateTask,
    db=Depends(get_db),
    current_user = Depends(check_roles([Roles.MANAGER]))
):
    return await service.update_task(
        task_id,
        task_data,
        db,
        current_user
    )


@router.delete(
    "/delete_task/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_task(
    task_id: str,
    db=Depends(get_db),
    current_user = Depends(check_roles([Roles.MANAGER]))
):
    await service.delete_task(
        task_id,
        db,
        current_user
    )

@router.get("/deleted_tasks",response_model=list[PublicTask])
async def get_deleted_tasks(db=Depends(get_db),current_user=Depends(check_roles([Roles.MANAGER]))):
    return await service.get_deleted_tasks(db,current_user)

@router.get("/update_progress/{task_id}",response_model=dict)
async def update_task_status(task_id:str,progress:TaskStatus,db=Depends(get_db),current_user=Depends(check_roles([Roles.MANAGER,Roles.CONTRIBUTOR]))):
    return await service.update_task_status(task_id,progress,db,current_user)

@router.get("/update_priority/{task_id}",response_model=dict)
async def update_task_priority(task_id:str,priority:TaskPriority,db=Depends(get_db),current_user=Depends(check_roles([Roles.MANAGER]))):
    return await service.update_task_priority(task_id,priority,db,current_user)