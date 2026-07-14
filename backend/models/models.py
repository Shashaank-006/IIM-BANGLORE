from sqlalchemy import Column, Integer, String, Float
from databases.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String)
    scheme = Column(String)      # <-- Add this line
    budget = Column(Float)
    district = Column(String)
    state = Column(String)
    status = Column(String)


class Verification(Base):
    __tablename__ = "verification"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer)
    status = Column(String)
    confidence = Column(Integer)
    recommendation = Column(String)