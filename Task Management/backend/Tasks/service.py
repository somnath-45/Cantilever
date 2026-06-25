from fastapi import HTTPException, status
from Tasks.schema import UpdateTask
from Core.auth import Roles
from User.service import get_user_by_name
from Tasks import crud

def serialize_task(task):

    return {
        "id": str(task["_id"]),
        "task_name": task["task_name"],
        "description": task["description"],
        "priority": task["priority"],
        "due_date": task["due_date"],
        "assigned_to": task["assigned_to"],
        "owner_id": task["owner_id"],
        "status": task["status"],
        "is_deleted": task["is_deleted"],
        "created_at": task["created_at"],
        "updated_at": task["updated_at"]
    }
async def get_task_by_id(
    task_id: str,
    db,
    current_user
):
    task = await crud.get_task_by_id(
        task_id,
        db
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Manager → only own tasks
    if (
        current_user["role"] == Roles.MANAGER.value
        and task["owner_id"] != str(current_user["_id"])
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Contributor → only assigned tasks
    if (
        current_user["role"] == Roles.CONTRIBUTOR.value
        and task["assigned_to"] != current_user["name"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return serialize_task(task)


async def get_task_by_name(
    task_name,
    db,
    current_user
):
    task = await crud.get_task_by_name(
        task_name,
        db,
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if (
        current_user["role"] == Roles.MANAGER.value
        and task["owner_id"] != str(current_user["_id"])
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if (
        current_user["role"] == Roles.CONTRIBUTOR.value
        and task["assigned_to"] != current_user["name"]
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return serialize_task(task)


async def create_task(
    task_data,
    owner_id,
    db,
    current_user
):
    if current_user["role"]==Roles.CONTRIBUTOR.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied")
    existing_task = await crud.get_task_by_name(
    task_data.task_name,
    db,
    str(owner_id)
)
    if existing_task:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,detail="Task already exists")
    task = await crud.create_task(
        task_data,
        owner_id,
        db
    )

    return serialize_task(
        task
    )


async def get_task_assigned_to(name, db, skip, limit):

    user = await get_user_by_name(name, db)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    tasks = await crud.get_task_assigned_to(
        user["name"],
        db,
        skip,
        limit
    )

    if not tasks:
        raise HTTPException(
            status_code=404,
            detail="No task assigned yet"
        )

    return [
        serialize_task(task)
        for task in tasks
    ]

async def get_all_tasks(
    db,
    skip,
    limit,
    current_user
):
    owner_id = None

    if current_user["role"] == Roles.MANAGER.value:
        owner_id = str(current_user["_id"])

    tasks = await crud.get_all_tasks(
        db,
        skip,
        limit,
        owner_id
    )

    if current_user["role"] == Roles.CONTRIBUTOR.value:
        return await get_task_assigned_to(
            current_user["name"],
            db,
            skip,
            limit
        )

    if not tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No task assigned yet"
        )

    return [
        serialize_task(task)
        for task in tasks
    ]
    


async def filter_task(
    db,
    skip,
    limit,
    deadline,
    priority,
    task_status,
    current_user
):
    assigned_to = None
    owner_id = None

    if current_user["role"] == Roles.CONTRIBUTOR.value:
        assigned_to = current_user["name"]

    if current_user["role"] == Roles.MANAGER.value:
        owner_id = str(current_user["_id"])

    tasks = await crud.filter_tasks(
        db,
        skip,
        limit,
        deadline,
        priority,
        task_status,
        assigned_to,
        owner_id
    )

    if not tasks:
        raise HTTPException(
            status_code=404,
            detail="No task found"
        )

    return [
        serialize_task(task)
        for task in tasks
    ]
    
async def update_task(
    task_id: str,
    task_data: UpdateTask,
    db,
    current_user
):
    await get_task_by_id(
        task_id,
        db,
        current_user
    )
    if current_user["role"]==Roles.CONTRIBUTOR.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied")
    task = await crud.update_task(
    task_id,
    task_data,
    db,
    str(current_user["_id"])
    if current_user["role"] == Roles.MANAGER.value
    else None
)

    return serialize_task(task)
    
async def delete_task(
    task_id: str,
    db,
    current_user
):
    if current_user["role"] == Roles.CONTRIBUTOR.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied")
    await get_task_by_id(
        task_id,
        db,
        current_user
    )
    if current_user["role"]==Roles.MANAGER.value:
        return await crud.delete_task(
            task_id,
            db,
            str(current_user["_id"])
            if current_user["role"] == Roles.MANAGER.value
            else None
)

async def get_deleted_tasks(
    db,
    current_user
):
    if current_user["role"] == Roles.CONTRIBUTOR.value:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    tasks = await crud.get_deleted_tasks(
    db,
    str(current_user["_id"])
    if current_user["role"] == Roles.MANAGER.value
    else None
)

    if not tasks:
        raise HTTPException(
            status_code=404,
            detail="No task available"
        )

    if current_user["role"] == Roles.MANAGER.value:
        tasks = [
            task
            for task in tasks
            if task["owner_id"] == str(current_user["_id"])
        ]

    return [
        serialize_task(task)
        for task in tasks
    ]

async def update_task_status(task_id,progress,db,current_user):
    task = await get_task_by_id(task_id,db,current_user)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="No task found")
    if current_user["role"]==Roles.MANAGER.value:
        await crud.update_task_status(task_id,progress,db)
        return {"message": "Progress updated"}
    if task["assigned_to"]!=str(current_user["name"]):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied")
    await crud.update_task_status(task_id,progress,db)
    return {"message": "Progress updated"}


async def update_task_priority(task_id,progress,db,current_user):
    if current_user["role"]==Roles.CONTRIBUTOR.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="Access denied")
    task = await get_task_by_id(task_id,db,current_user)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="No task found")
    if current_user["role"]==Roles.MANAGER.value:
        await crud.update_task_priority(task_id,progress,db)
        return {"message": "Priority updated"}