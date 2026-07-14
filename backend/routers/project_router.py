from fastapi import APIRouter
from pydantic import BaseModel

from databases.database import SessionLocal
from models.models import Project


router = APIRouter()

db = SessionLocal()


class ProjectRequest(BaseModel):
    project_name: str
    budget: float
    district: str
    state: str
    status: str



@router.get("/projects")
def get_projects():

    projects = db.query(Project).all()

    return projects



@router.post("/projects")
def create_project(project: ProjectRequest):

    new_project = Project(
        project_name=project.project_name,
        budget=project.budget,
        district=project.district,
        state=project.state,
        status=project.status
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project Added Successfully",
        "project": new_project
    }



@router.get("/projects/{project_id}")
def get_project(project_id: int):

    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    return project