from pydantic_settings import BaseSettings,SettingsConfigDict

class Settings(BaseSettings):
    MONGO_URL:str
    ALGORITHM:str
    DATABASE_NAME:str
    SECRET_KEY:str

    model_config = SettingsConfigDict(
        env_file=".env"
    )
def get_settings():
    return Settings()