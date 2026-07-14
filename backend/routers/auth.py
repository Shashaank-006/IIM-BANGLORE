from fastapi import APIRouter
from pydantic import BaseModel

from databases.database import SessionLocal
from models.models import User

router = APIRouter()

db = SessionLocal()


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(request: LoginRequest):

    user = db.query(User).filter(User.email == request.email).first()

    if user is None:
        return {
            "success": False,
            "message": "User Not Found"
        }

    if user.password != request.password:
        return {
            "success": False,
            "message": "Incorrect Password"
        }

    return {
        "success": True,
        "name": user.name,
        "role": user.role
    }