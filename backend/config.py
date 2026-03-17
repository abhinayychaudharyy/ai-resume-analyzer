import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
UPLOAD_DIR = "uploads"
MODEL_NAME = "llama-3.3-70b-versatile"
TEMPERATURE = 0

if not OPENAI_API_KEY:
    raise ValueError("API Key not found! Check your .env file")