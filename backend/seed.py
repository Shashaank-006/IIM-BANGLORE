import json
from databases.database import SessionLocal, engine
from models.models import (
    Base, User, Project, AuditAssignment, VerificationRequest, 
    FieldInspection, AIConfig, Anomaly, Report, ProjectUpdate,
    Contractor, Scheme, BudgetAllocations, ActivityFeedItem, AuditLog, Notification
)

# Recreate database tables to apply schema modifications (clean empty slate)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
db.commit()
print("Database Seeded Successfully with clean empty state!")

db.commit()
print("Database Seeded Successfully with clean empty state!")