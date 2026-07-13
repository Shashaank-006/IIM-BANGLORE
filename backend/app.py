from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from databases.database import engine 
from models.models import Base

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="Bhoot Nirman API",
    description="Backend API for AI Infrastructure Verification",
    version="1.0.0"
)

# Allow React frontend to connect
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Bhoot Nirman Backend 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "Running",
        "backend": "FastAPI",
        "version": "1.0.0"
    }