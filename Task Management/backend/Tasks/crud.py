from bson import ObjectId

from datetime import datetime


async def create_task(
    task_data,
    owner_id,
    db
):
    task = task_data.model_dump()

    task["owner_id"] = owner_id

    task["status"] = "todo"

    task["is_deleted"] = False

    task["created_at"] = datetime.utcnow()

    task["updated_at"] = datetime.utcnow()

    result = await db.tasks.insert_one(
        task
    )

    created_task = await db.tasks.find_one(
        {
            "_id": result.inserted_id
        }
    )

    return created_task

async def get_task_by_name(
    task_name,
    db,
    owner_id=None
):
    query = {
        "task_name": task_name,
        "is_deleted": {
            "$ne": True
        }
    }

    if owner_id:
        query["owner_id"] = owner_id

    return await db.tasks.find_one(query)


async def get_task_by_id(
    task_id,
    db,
    owner_id=None
):
    query = {
        "_id": ObjectId(task_id),
        "is_deleted": {
            "$ne": True
        }
    }

    if owner_id:
        query["owner_id"] = owner_id

    return await db.tasks.find_one(query)


async def get_all_tasks(
    db,
    skip,
    limit,
    owner_id=None
):
    query = {
        "is_deleted": {
            "$ne": True
        }
    }

    if owner_id:
        query["owner_id"] = owner_id

    return await (
        db.tasks
        .find(query)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )

async def get_task_assigned_to(user_name,db,skip,limit):
    tasks = await (db.tasks.find({
        "assigned_to":user_name,"is_deleted":{"$ne": True}
        })
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return tasks

async def filter_tasks(
    db,
    skip,
    limit,
    deadline=None,
    priority=None,
    task_status=None,
    assigned_to=None,
    owner_id=None
):
    query = {
        "is_deleted": False
    }

    if deadline:
        query["due_date"] = deadline

    if priority:
        query["priority"] = priority

    if task_status:
        query["status"] = task_status

    if assigned_to:
        query["assigned_to"] = assigned_to

    if owner_id:
        query["owner_id"] = owner_id

    return await (
        db.tasks
        .find(query)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
async def update_task(
    task_id,
    task_data,
    db,
    owner_id=None
):
    updated = task_data.model_dump(
        exclude_unset=True
    )

    updated["updated_at"] = (
        datetime.utcnow()
    )

    query = {
        "_id": ObjectId(task_id)
    }

    if owner_id:
        query["owner_id"] = owner_id

    await db.tasks.update_one(
        query,
        {
            "$set": updated
        }
    )

    return await db.tasks.find_one(query)


async def delete_task(
    task_id,
    db,
    owner_id=None
):
    query = {
        "_id": ObjectId(task_id)
    }

    if owner_id:
        query["owner_id"] = owner_id

    await db.tasks.update_one(
        query,
        {
            "$set": {
                "is_deleted": True
            }
        }
    )

    return await db.tasks.find_one(query)
async def get_deleted_tasks(
    db,
    owner_id=None
):
    query = {
        "is_deleted": True
    }

    if owner_id:
        query["owner_id"] = owner_id

    return await db.tasks.find(
        query
    ).to_list(length=None)

async def update_task_status(task_id,progress,db):
    task = await db.tasks.update_one(
        {
            "_id":ObjectId(task_id)
        },
        {
            "$set":{
                "status":progress.value
            }
        }
    )

async def update_task_priority(task_id,priority,db):
    await db.tasks.update_one(
        {
            "_id":ObjectId(task_id)
        },
        {
            "$set":{
                "priority":priority.value
            }
        }
    )