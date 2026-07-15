from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from databases.database import engine
from models.models import Base

from routers.auth import router as auth_router
from routers.project_router import router as project_router
from routers.verification import router as verification_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bhoot Nirman API",
    description="Backend API for AI Infrastructure Verification",
    version="1.0.0"
)

# Allow React frontend to connect
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(project_router, prefix="/api", tags=["projects"])
app.include_router(verification_router, prefix="/api/verification", tags=["verification"])

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