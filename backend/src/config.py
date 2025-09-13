from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel



class BotConfig(BaseModel):
    token: str = "TOKEN"
    base_url: str = "https://default_base_url.com"
    admin_ids: list[int] = [123456789]
    web_app: str = "https://default_web_app_url.com"


class Settings(BaseSettings):
    bot: BotConfig = BotConfig()

    model_config = SettingsConfigDict(
        env_file=(".env"),
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
        extra="ignore",
    )


settings = Settings()