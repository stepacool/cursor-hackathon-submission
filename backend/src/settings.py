from pydantic import AnyUrl, field_validator, FieldValidationInfo
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class MySQLSettings(BaseSettings):
    """
    MySQL/TiDB Cloud connection settings
    Connection string format: mysql://ThihWp1nSaKQzsm.root:<PASSWORD>@gateway01.eu-central-1.prod.aws.tidbcloud.com:4000/test
    """

    MYSQL_HOST: str = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
    MYSQL_PORT: int = 4000
    MYSQL_USER: str = "ThihWp1nSaKQzsm.root"
    MYSQL_PASSWORD: str = ""  # Set this via environment variable
    MYSQL_DB: str = "test"
    MYSQL_SSL: bool = True  # TiDB Cloud requires SSL


    ASYNC_DB_DSN: AnyUrl | str | None = None
    SYNC_DB_DSN: AnyUrl | str | None = None

    @staticmethod
    def _make_db_uri(scheme: str, value: str | None, values: FieldValidationInfo) -> AnyUrl | str:
        if isinstance(value, str):
            return value

        # Build base URL
        url = AnyUrl.build(
            scheme=scheme,
            username=values.data.get("MYSQL_USER"),
            password=values.data.get("MYSQL_PASSWORD"),
            host=values.data.get("MYSQL_HOST"),  # type: ignore[arg-type]
            port=values.data.get("MYSQL_PORT"),
            path=f"{values.data.get('MYSQL_DB') or ''}",
        )

        # Add SSL parameter if required
        if values.data.get("MYSQL_SSL"):
            return f"{url}?ssl=true"
        return url

    @field_validator("ASYNC_DB_DSN", mode="before")
    @classmethod
    def async_mysql_dsn(cls, v: str | None, values: FieldValidationInfo) -> AnyUrl | str:
        return cls._make_db_uri(scheme="mysql+aiomysql", value=v, values=values)

    @field_validator("SYNC_DB_DSN", mode="before")
    @classmethod
    def sync_mysql_dsn(cls, v: str | None, values: FieldValidationInfo) -> AnyUrl | str:
        return cls._make_db_uri(scheme="mysql+pymysql", value=v, values=values)


class CoreSettings(BaseSettings):
    """Add your core settings here"""
    APP_NAME: str = "Hackathon App"
    DEBUG: bool = True

    PROJECT_URL: str = "https://webhook.site/c7ec072b-27fb-48be-86f9-7bb7029fde20"


class GROQSettings(BaseSettings):
    GROQ_PRIVATE_API_KEY: str = ""
    GROQ_PHONE_NUMBER_ID: str = ""


class StorageSettings(BaseSettings):
    """Add your storage settings here"""
    pass


class Settings(
    CoreSettings,
    MySQLSettings,
    StorageSettings,
    GROQSettings,
    BaseSettings,
):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="allow",
    )


settings = Settings()
