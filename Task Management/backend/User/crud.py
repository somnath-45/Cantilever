from bson import ObjectId
from bson.errors import InvalidId 
from Core.security import get_password_hash

async def create_user(user_data, db):
    user = user_data.model_dump()
    user["is_delete"] = False
    user["password"] = get_password_hash(
        user["password"]
    )

    result = await db.users.insert_one(
        user
    )

    created_user = await db.users.find_one(
        {
            "_id": result.inserted_id
        }
    )

    created_user["id"] = str(
        created_user.pop("_id")
    )

    created_user.pop(
        "password",
        None
    )

    return created_user


async def get_user_by_name(user_name, db):
    user = await db.users.find_one(
        {"name": user_name}
    )
    return user


async def get_user_by_id(user_id, db):
    try:
        return await db.users.find_one(
            {"_id": ObjectId(user_id)}
        )
    except InvalidId:
        return None


async def update_user(user_id, user_data, db):
    updated_user = user_data.model_dump(
        exclude_unset=True
    )
    if "password" in updated_user:
        updated_user["password"] = get_password_hash(updated_user["password"])
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": updated_user}
    )

    user = await db.users.find_one(
        {"_id": ObjectId(user_id)}
    )

    user["id"] = str(
        user.pop("_id")
    )
    return user


async def delete_user(user_id, db):
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "is_deleted": True
            }
        }
    )

    user = await db.users.find_one(
        {"_id": ObjectId(user_id),
         "is_delete":False}
    )
    user["id"] = str(
        user.pop("_id")
    )
    return user

async def login_for_credentials(
    user_name: str,
    db
):
    return await db.users.find_one(
        {
            "name": user_name,
            "is_deleted": False
        }
    )