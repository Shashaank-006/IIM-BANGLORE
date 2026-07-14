from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

<<<<<<< HEAD
from databases.database import engine
from models.models import Base

from routers.auth import router as auth_router
from routers.project_router import router as project_router


# Create database tables
Base.metadata.create_all(bind=engine)


=======
from databases.database import engine 
from models.models import Base

Base.metadata.create_all(bind=engine)
>>>>>>> aad4629d930ea743735a0daeea82cf8b05dfd907
app = FastAPI(
    title="Bhoot Nirman API",
    description="Backend API for AI Infrastructure Verification",
    version="1.0.0"
)

<<<<<<< HEAD

=======
>>>>>>> aad4629d930ea743735a0daeea82cf8b05dfd907
# Allow React frontend to connect
origins = [
    "http://localhost:5173",
]

<<<<<<< HEAD

=======
>>>>>>> aad4629d930ea743735a0daeea82cf8b05dfd907
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


<<<<<<< HEAD
# Register Routers
app.include_router(auth_router)
app.include_router(project_router)



=======
>>>>>>> aad4629d930ea743735a0daeea82cf8b05dfd907
@app.get("/")
def home():
    return {
        "message": "Welcome to Bhoot Nirman Backend 🚀"
    }


<<<<<<< HEAD

=======
>>>>>>> aad4629d930ea743735a0daeea82cf8b05dfd907
@app.get("/health")
def health():
    return {
        "status": "Running",
        "backend": "FastAPI",
        "version": "1.0.0"
    }