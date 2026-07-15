from sqlalchemy import Column, Integer, String, Float, Text
from databases.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    employee_id = Column(String, nullable=True)
    department = Column(String, nullable=True)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, unique=True, index=True, nullable=True)
    project_name = Column(String)
    scheme = Column(String, nullable=True)
    budget = Column(Float)
    district = Column(String)
    state = Column(String)
    status = Column(String)
    extended_data = Column(Text, nullable=True)


class Verification(Base):
    __tablename__ = "verification"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, index=True)
    status = Column(String)
    confidence = Column(Integer)
    recommendation = Column(String)
    details = Column(Text, nullable=True)


class AuditAssignment(Base):
    __tablename__ = "audit_assignments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True)
    project_name = Column(String)
    state = Column(String)
    risk = Column(String)
    assigned = Column(String)
    due_date = Column(String)
    status = Column(String)
    budget = Column(Float)
    location = Column(String)


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True)
    project = Column(String)
    contractor = Column(String)
    amount = Column(Float)
    stage = Column(String)
    status = Column(String)


class FieldInspection(Base):
    __tablename__ = "field_inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(String, unique=True, index=True)
    project = Column(String)
    officer = Column(String)
    scheduled_date = Column(String)
    milestone = Column(String)
    status = Column(String)


class AIConfig(Base):
    __tablename__ = "ai_config"

    id = Column(Integer, primary_key=True, index=True)
    satellite_confidence = Column(Integer)
    material_deviation_threshold = Column(Integer)
    geotag_radius_tolerance = Column(Integer)
    contractor_risk_threshold = Column(Integer)


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    anomaly_id = Column(String, unique=True, index=True)
    project = Column(String)
    check_type = Column(String)
    detail = Column(String)
    confidence = Column(Integer)
    status = Column(String)
    severity = Column(String)
    deadline = Column(String)
    response = Column(Text, nullable=True)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String, unique=True, index=True)
    title = Column(String)
    format = Column(String)
    size = Column(String)
    date = Column(String)
    officer = Column(String, nullable=True)
    outcome = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    milestone = Column(String, nullable=True)


class ProjectUpdate(Base):
    __tablename__ = "project_updates"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, index=True)
    note = Column(Text)
    timestamp = Column(String)


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    registration = Column(String)
    pan = Column(String)
    gstin = Column(String)
    state = Column(String)
    active_projects = Column(Integer)
    completed_projects = Column(Integer)
    total_contract_value = Column(Float)
    risk_score = Column(String)
    verification_status = Column(String)
    last_verified = Column(String)
    payment_rating = Column(Float)
    red_flags = Column(Text)  # JSON-encoded list of strings
    specializations = Column(Text)  # JSON-encoded list of strings


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    full_name = Column(String)
    color = Column(String)
    budget = Column(Float)


class BudgetAllocations(Base):
    __tablename__ = "budget_allocations"

    id = Column(Integer, primary_key=True, index=True)
    central_allocation = Column(Float)
    state_released = Column(Float)
    district_disbursed = Column(Float)
    utilized = Column(Float)
    monthly_trend = Column(Text)  # JSON-encoded list of dicts
    scheme_wise = Column(Text)  # JSON-encoded list of dicts
    pending_reimbursements = Column(Text)  # JSON-encoded list of dicts



class ActivityFeedItem(Base):
    __tablename__ = "activity_feed"

    id = Column(Integer, primary_key=True, index=True)
    time = Column(String)
    date = Column(String)
    actor = Column(String)
    action = Column(String)
    target = Column(String)
    type = Column(String)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(String)
    actor = Column(String)
    actor_type = Column(String)
    action = Column(String)
    entity = Column(String)
    entity_name = Column(String)
    detail = Column(Text)
    severity = Column(String)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # 'alert', 'action', 'info'
    title = Column(String)
    desc = Column(String)
    time = Column(String)
    read = Column(Integer, default=0)  # 0 = false, 1 = true