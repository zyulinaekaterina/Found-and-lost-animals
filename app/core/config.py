import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "lsfb3*3bLfh2ldfM4l592bwlfkB320!sb3l2n")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    REFRESH_TOKEN_EXPIRE_DAYS = 7

    PROJECT_NAME = "Animal Finder API"
    VERSION = "1.0.0"

settings = Settings()