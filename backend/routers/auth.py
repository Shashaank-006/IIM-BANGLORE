from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from databases.database import SessionLocal
from models.models import User

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str
    fullName: str = Field(..., alias="fullName")
    role: str
    employeeId: str = Field(..., alias="employeeId")
    department: str

    class Config:
        populate_by_name = True


class AddUserRequest(BaseModel):
    name: str
    email: str
    password: str = "GovWatch@2026"
    role: str
    dept: str
    employeeId: str = None


@router.post("/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
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
            "email": user.email,
            "role": user.role,
            "employeeId": user.employee_id,
            "department": user.department
        }
    finally:
        db.close()


@router.post("/signup")
def signup(request: SignupRequest):
    db = SessionLocal()
    try:
        # Check if user already exists
        existing = db.query(User).filter(User.email == request.email).first()
        if existing:
            return {
                "success": False,
                "message": "Email already registered"
            }

        new_user = User(
            name=request.fullName,
            email=request.email,
            password=request.password,
            role=request.role,
            employee_id=request.employeeId,
            department=request.department
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {
            "success": True,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "employeeId": new_user.employee_id,
            "department": new_user.department
        }
    finally:
        db.close()


@router.get("/users")
def get_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return [
            {
                "id": f"USR-{u.id}",
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "dept": u.department or "",
                "status": "Active"
            }
            for u in users
        ]
    finally:
        db.close()


@router.post("/users")
def add_user(req: AddUserRequest):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_user = User(
            name=req.name,
            email=req.email,
            password=req.password,
            role=req.role,
            employee_id=req.employeeId or f"EMP-{req.role[:2].upper()}-{100 + db.query(User).count()}",
            department=req.dept
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "id": f"USR-{new_user.id}",
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "dept": new_user.department,
            "status": "Active"
        }
    finally:
        db.close()


@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    try:
        id_val = int(user_id.replace("USR-", ""))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
        
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == id_val).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(user)
        db.commit()
        return {"success": True, "message": "User deactivated successfully"}
    finally:
        db.close()