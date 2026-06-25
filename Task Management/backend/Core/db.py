from motor.motor_asyncio import AsyncIOMotorClient
from decouple import config
import certifi

MONGO_URL = config("MONGO_URL")
DATABASE_NAME = config("DATABASE_NAME")

client = AsyncIOMotorClient(
    MONGO_URL,
    tls=True,
    tlsCAFile=certifi.where()
)

db = client[DATABASE_NAME]


# REQUIRED because auth.py imports it
def get_db():
    return db