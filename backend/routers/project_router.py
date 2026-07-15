import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from databases.database import SessionLocal
from models.models import (
    Project, AuditAssignment, VerificationRequest, FieldInspection,
    AIConfig, Anomaly, Report, ProjectUpdate,
    Contractor, Scheme, BudgetAllocations, ActivityFeedItem, AuditLog, Notification
)

router = APIRouter()

# Helper function to get db session per request
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


class AssignRequest(BaseModel):
    assigned: str


class AIConfigRequest(BaseModel):
    satelliteConfidence: int
    materialDeviationThreshold: int
    geotagRadiusTolerance: int
    contractorRiskThreshold: int


class AnomalyResponseRequest(BaseModel):
    response: str


class AnomalyStatusRequest(BaseModel):
    status: str


class ProjectUpdateRequest(BaseModel):
    note: str
    completion: int = None


class CompletionReportRequest(BaseModel):
    project: str
    milestone: str
    completedDate: str
    remarks: str


# --- Project REST Endpoints ---

@router.get("/projects")
def get_projects():
    db = get_db()
    projects = db.query(Project).all()
    
    result = []
    for p in projects:
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                data["db_id"] = p.id
                result.append(data)
            except Exception:
                result.append({
                    "id": p.project_id or f"PRJ-{p.id}",
                    "name": p.project_name,
                    "scheme": p.scheme,
                    "budget": p.budget,
                    "district": p.district,
                    "state": p.state,
                    "status": p.status
                })
        else:
            result.append({
                "id": p.project_id or f"PRJ-{p.id}",
                "name": p.project_name,
                "scheme": p.scheme,
                "budget": p.budget,
                "district": p.district,
                "state": p.state,
                "status": p.status
            })
            
    return result


@router.get("/projects/{project_id}")
def get_project(project_id: str):
    db = get_db()
    p = db.query(Project).filter((Project.project_id == project_id) | (Project.id == project_id)).first()
    
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if p.extended_data:
        try:
            data = json.loads(p.extended_data)
            data["db_id"] = p.id
            return data
        except Exception:
            pass
            
    return {
        "id": p.project_id or f"PRJ-{p.id}",
        "name": p.project_name,
        "scheme": p.scheme,
        "budget": p.budget,
        "district": p.district,
        "state": p.state,
        "status": p.status
    }


@router.post("/projects")
def create_project(project_data: dict):
    db = get_db()
    project_id = project_data.get("id") or project_data.get("projectId")
    project_name = project_data.get("name") or project_data.get("projectName")
    scheme = project_data.get("scheme") or project_data.get("schemeName")
    budget = float(project_data.get("budget") or project_data.get("estimatedBudget") or 0)
    district = project_data.get("district")
    state = project_data.get("state")
    status = project_data.get("status") or "Registered"
    
    if "id" not in project_data and project_id:
        project_data["id"] = project_id
        
    existing = db.query(Project).filter(Project.project_id == project_id).first()
    if existing:
        existing.project_name = project_name
        existing.scheme = scheme
        existing.budget = budget
        existing.district = district
        existing.state = state
        existing.status = status
        existing.extended_data = json.dumps(project_data)
        db.commit()
        db.refresh(existing)
        return {
            "message": "Project Updated Successfully",
            "project": project_data
        }
        
    new_project = Project(
        project_id=project_id,
        project_name=project_name,
        scheme=scheme,
        budget=budget,
        district=district,
        state=state,
        status=status,
        extended_data=json.dumps(project_data)
    )
    
    db.add(new_project)
    
    # Generate associated workflow tasks to make the system 100% dynamic
    contractor_name = project_data.get("contractor") or project_data.get("contractorName") or "Coastal Infra Ventures LLP"
    
    # 1. Create a simulated VerificationRequest (disbursement claim)
    claim_id = f"VR-{project_id.split('-')[-1]}"
    new_claim = VerificationRequest(
        request_id=claim_id,
        project=project_name,
        contractor=contractor_name,
        amount=budget * 0.25, # 25% of project budget
        stage="Initial Mobilization",
        status="Awaiting Approval"
    )
    db.add(new_claim)
    
    # 2. Create a scheduled FieldInspection
    insp_id = f"FI-{project_id.split('-')[-1]}"
    new_inspection = FieldInspection(
        inspection_id=insp_id,
        project=project_name,
        officer="Amit Deshmukh",
        scheduled_date="2026-07-20",
        milestone="Base Course Verification",
        status="Scheduled"
    )
    db.add(new_inspection)
    
    # 3. Create a simulated AI Anomaly Flag
    anom_id = f"ANM-{project_id.split('-')[-1]}"
    new_anomaly = Anomaly(
        anomaly_id=anom_id,
        project=project_name,
        check_type="Exif Misalignment",
        detail="Coordinates drifted by 62 meters on visual embankment foundation.",
        confidence=91,
        status="Flagged",
        severity="High",
        deadline="2026-07-25"
    )
    db.add(new_anomaly)
    
    # 4. Create an AuditAssignment task
    task_id = f"AUD-{project_id.split('-')[-1]}"
    new_audit = AuditAssignment(
        task_id=task_id,
        project_name=project_name,
        state=state,
        risk="High",
        assigned="Unassigned",
        due_date="2026-08-20",
        status="Pending Review",
        budget=budget,
        location=f"{district or 'Unknown'}, {state or 'Unknown'}"
    )
    db.add(new_audit)
    
    db.commit()
    db.refresh(new_project)
    
    return {
        "message": "Project Added Successfully",
        "project": project_data
    }


# --- Dynamic KPIs & Overviews ---

@router.get("/dashboard-stats")
def get_dashboard_stats(role: str = None):
    db = get_db()
    
    projects = db.query(Project).all()
    anomalies = db.query(Anomaly).all()
    claims = db.query(VerificationRequest).all()
    inspections = db.query(FieldInspection).all()
    
    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status == "In Progress")
    completed_projects = sum(1 for p in projects if p.status == "Completed")
    delayed_projects = sum(1 for p in projects if p.status == "Delayed")
    suspended_projects = sum(1 for p in projects if p.status == "Suspended")
    
    total_budget = sum(p.budget for p in projects)
    total_spent = 0
    for p in projects:
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                total_spent += float(data.get("spent") or 0)
            except Exception:
                pass
                
    budget_utilization = round((total_spent / total_budget * 100), 1) if total_budget > 0 else 58.5
    
    role_kpi = {
        "totalProjects": total_projects,
        "activeProjects": active_projects,
        "completedProjects": completed_projects,
        "delayedProjects": delayed_projects,
        "suspendedProjects": suspended_projects,
        "totalBudget": total_budget,
        "budgetUtilization": budget_utilization,
        "flaggedContractors": 2,
        "verifiedContractors": 5,
        "totalContractors": 7,
        "fraudAlertsThisMonth": len(anomalies),
        "pendingDisbursements": sum(1 for c in claims if c.status == "Awaiting Approval")
    }
    
    # Generate active alerts list dynamically
    alerts = []
    for an in anomalies:
        if an.status == "Flagged":
            alerts.append({
                "title": f"{an.anomaly_id} — {an.check_type}",
                "desc": f"{an.project}: {an.detail}",
                "color": "var(--accent-red)" if an.severity == "High" else "var(--accent-amber)"
            })
            
    # Add pending inspections to alerts
    for fi in inspections:
        if fi.status == "Pending Assignment":
            alerts.append({
                "title": f"Inspection {fi.inspection_id} — Unassigned",
                "desc": f"{fi.project} milestone {fi.milestone} needs an officer",
                "color": "var(--accent-amber)"
            })
            
    return {
        "kpi": role_kpi,
        "alerts": alerts
    }


@router.get("/state-comparison")
def get_state_comparison():
    db = get_db()
    projects = db.query(Project).all()
    
    state_groups = {}
    for p in projects:
        state = p.state
        if state not in state_groups:
            state_groups[state] = {"projectsCount": 0, "totalBudget": 0.0, "spent": 0.0, "completions": []}
        
        state_groups[state]["projectsCount"] += 1
        state_groups[state]["totalBudget"] += p.budget
        
        spent = 0.0
        completion = 0
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                spent = float(data.get("spent") or 0)
                completion = int(data.get("completion") or 0)
            except Exception:
                pass
        
        state_groups[state]["spent"] += spent
        state_groups[state]["completions"].append(completion)
        
    result = []
    for state, info in state_groups.items():
        avg_completion = int(sum(info["completions"]) / len(info["completions"])) if info["completions"] else 0
        risk = "Low"
        if avg_completion < 40:
            risk = "High"
        elif avg_completion < 70:
            risk = "Medium"
            
        result.append({
            "state": state,
            "projectsCount": info["projectsCount"],
            "totalBudget": info["totalBudget"],
            "spent": info["spent"],
            "completion": avg_completion,
            "risk": risk
        })
        
    return result


@router.get("/district-performance")
def get_district_performance():
    db = get_db()
    projects = db.query(Project).all()
    
    district_groups = {}
    for p in projects:
        dist = p.district
        if dist not in district_groups:
            district_groups[dist] = {"projects": 0, "budget": 0.0, "spent": 0.0, "completions": [], "alerts": 0}
            
        district_groups[dist]["projects"] += 1
        district_groups[dist]["budget"] += p.budget
        
        spent = 0.0
        completion = 0
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                spent = float(data.get("spent") or 0)
                completion = int(data.get("completion") or 0)
            except Exception:
                pass
                
        district_groups[dist]["spent"] += spent
        district_groups[dist]["completions"].append(completion)
        
    result = []
    for dist, info in district_groups.items():
        avg_completion = int(sum(info["completions"]) / len(info["completions"])) if info["completions"] else 0
        
        # Count anomalies for this district's projects
        anom_count = db.query(Anomaly).filter(Anomaly.project.like(f"%{dist}%")).count()
        
        risk = "Low"
        if anom_count > 1:
            risk = "High"
        elif anom_count > 0:
            risk = "Medium"
            
        result.append({
            "district": dist,
            "projects": info["projects"],
            "budget": info["budget"],
            "spent": info["spent"],
            "completion": avg_completion,
            "alerts": anom_count,
            "risk": risk
        })
        
    return result


# --- Static / Metadata Endpoints ---

@router.get("/schemes")
def get_schemes():
    db = get_db()
    schemes = db.query(Scheme).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "fullName": s.full_name,
            "color": s.color,
            "budget": s.budget
        }
        for s in schemes
    ]


@router.get("/contractors")
def get_contractors():
    db = get_db()
    contractors = db.query(Contractor).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "registration": c.registration,
            "pan": c.pan,
            "gstin": c.gstin,
            "state": c.state,
            "activeProjects": c.active_projects,
            "completedProjects": c.completed_projects,
            "totalContractValue": c.total_contract_value,
            "riskScore": c.risk_score,
            "verificationStatus": c.verification_status,
            "lastVerified": c.last_verified,
            "paymentRating": c.payment_rating,
            "redFlags": json.loads(c.red_flags or "[]"),
            "specializations": json.loads(c.specializations or "[]")
        }
        for c in contractors
    ]


@router.get("/budget-data")
def get_budget_data():
    db = get_db()
    b = db.query(BudgetAllocations).first()
    if not b:
        return {}
    return {
        "centralAllocation": b.central_allocation,
        "stateReleased": b.state_released,
        "districtDisbursed": b.district_disbursed,
        "utilized": b.utilized,
        "monthlyTrend": json.loads(b.monthly_trend or "[]"),
        "schemeWise": json.loads(b.scheme_wise or "[]"),
        "pendingReimbursements": json.loads(b.pending_reimbursements or "[]")
    }


@router.get("/activity-feed")
def get_activity_feed():
    db = get_db()
    feed = db.query(ActivityFeedItem).all()
    return [
        {
            "id": f.id,
            "time": f.time,
            "date": f.date,
            "actor": f.actor,
            "action": f.action,
            "target": f.target,
            "type": f.type
        }
        for f in feed
    ]


@router.get("/audit-logs")
def get_audit_logs():
    db = get_db()
    logs = db.query(AuditLog).all()
    return [
        {
            "id": l.id,
            "timestamp": l.timestamp,
            "actor": l.actor,
            "actorType": l.actor_type,
            "action": l.action,
            "entity": l.entity,
            "entityName": l.entity_name,
            "detail": l.detail,
            "severity": l.severity
        }
        for l in logs
    ]


@router.get("/kpi-data")
def get_kpi_data():
    db = get_db()
    projects = db.query(Project).all()
    anomalies = db.query(Anomaly).all()
    claims = db.query(VerificationRequest).all()
    contractors = db.query(Contractor).all()
    
    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status == "In Progress")
    completed_projects = sum(1 for p in projects if p.status == "Completed")
    delayed_projects = sum(1 for p in projects if p.status == "Delayed")
    suspended_projects = sum(1 for p in projects if p.status == "Suspended")
    
    total_budget = sum(p.budget for p in projects)
    total_spent = 0.0
    for p in projects:
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                total_spent += float(data.get("spent") or 0)
            except Exception:
                pass
                
    budget_utilization = round((total_spent / total_budget * 100), 1) if total_budget > 0 else 58.5
    
    flagged_contractors = sum(1 for c in contractors if c.risk_score == "High")
    verified_contractors = sum(1 for c in contractors if c.verification_status == "Verified")
    total_contractors = len(contractors)
    
    return {
        "totalProjects": total_projects,
        "activeProjects": active_projects,
        "completedProjects": completed_projects,
        "delayedProjects": delayed_projects,
        "suspendedProjects": suspended_projects,
        "totalBudget": total_budget,
        "budgetUtilization": budget_utilization,
        "flaggedContractors": flagged_contractors,
        "verifiedContractors": verified_contractors,
        "totalContractors": total_contractors,
        "fraudAlertsThisMonth": len(anomalies),
        "pendingDisbursements": sum(1 for c in claims if c.status == "Awaiting Approval")
    }


@router.get("/district-data")
def get_district_data():
    db = get_db()
    projects = db.query(Project).all()
    anomalies = db.query(Anomaly).all()
    
    district_groups = {}
    for p in projects:
        dist = p.district or "Unknown"
        if dist not in district_groups:
            district_groups[dist] = {
                "name": dist,
                "state": p.state or "Unknown",
                "projects": 0,
                "budget": 0.0,
                "spent": 0.0,
                "completions": [],
                "lat": 20.5937,
                "lng": 78.9629
            }
            if p.extended_data:
                try:
                    data = json.loads(p.extended_data)
                    coords = data.get("coordinates")
                    if coords and len(coords) >= 2:
                        district_groups[dist]["lat"] = coords[0]
                        district_groups[dist]["lng"] = coords[1]
                except:
                    pass
            
        district_groups[dist]["projects"] += 1
        district_groups[dist]["budget"] += p.budget
        
        spent = 0.0
        completion = 0
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                spent = float(data.get("spent") or 0)
                completion = int(data.get("completion") or 0)
            except Exception:
                pass
                
        district_groups[dist]["spent"] += spent
        district_groups[dist]["completions"].append(completion)
        
    result = []
    for dist, info in district_groups.items():
        avg_completion = int(sum(info["completions"]) / len(info["completions"])) if info["completions"] else 0
        anom_count = sum(1 for a in anomalies if a.project and dist in a.project)
        
        risk = "Low"
        if anom_count > 1:
            risk = "High"
        elif anom_count > 0:
            risk = "Medium"
            
        result.append({
            "district": dist,
            "name": dist,
            "state": info["state"],
            "projects": info["projects"],
            "budget": info["budget"],
            "spent": info["spent"],
            "completion": avg_completion,
            "alerts": anom_count,
            "risk": risk,
            "lat": info["lat"],
            "lng": info["lng"]
        })
        
    return result


@router.get("/notifications")
def get_notifications():
    db = get_db()
    notifs = db.query(Notification).order_by(Notification.id.desc()).all()
    return [
        {
            "id": n.id,
            "type": n.type,
            "title": n.title,
            "desc": n.desc,
            "time": n.time,
            "read": bool(n.read)
        }
        for n in notifs
    ]


@router.post("/notifications/{id}/read")
def mark_notification_read(id: int):
    db = get_db()
    n = db.query(Notification).filter(Notification.id == id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.read = 1
    db.commit()
    return {"success": True}


@router.post("/notifications/read-all")
def mark_all_notifications_read():
    db = get_db()
    db.query(Notification).update({Notification.read: 1})
    db.commit()
    return {"success": True}



# --- Audit Assignments ---

@router.get("/audit-assignments")
def get_audit_assignments():
    db = get_db()
    return db.query(AuditAssignment).all()


@router.post("/audit-assignments/{task_id}/assign")
def assign_auditor(task_id: str, req: AssignRequest):
    db = get_db()
    task = db.query(AuditAssignment).filter(AuditAssignment.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Audit assignment task not found")
        
    task.assigned = req.assigned
    if req.assigned != "Unassigned":
        task.status = "In Progress"
    else:
        task.status = "Pending Review"
        
    db.commit()
    db.refresh(task)
    return task


@router.post("/audit-assignments/{task_id}/complete")
def complete_audit(task_id: str):
    db = get_db()
    task = db.query(AuditAssignment).filter(AuditAssignment.task_id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Audit assignment task not found")
        
    task.status = "Completed"
    
    # Also find the matching project and update its status to "Completed"
    project = db.query(Project).filter(Project.project_name.like(f"%{task.project_name}%") | Project.project_id.like(f"%{task.project_name}%")).first()
    if project:
        project.status = "Completed"
        if project.extended_data:
            try:
                data = json.loads(project.extended_data)
                data["status"] = "Completed"
                project.extended_data = json.dumps(data)
            except:
                pass
                
    db.commit()
    db.refresh(task)
    return {"success": True, "message": "Audit completed successfully"}


# --- Verification Requests (Contractor Claims) ---

@router.get("/verification-requests")
def get_verification_requests():
    db = get_db()
    return db.query(VerificationRequest).all()


@router.post("/verification-requests/{request_id}/approve")
def approve_request(request_id: str):
    db = get_db()
    claim = db.query(VerificationRequest).filter(VerificationRequest.request_id == request_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Verification request claim not found")
        
    claim.status = "Approved"
    
    # Find matching project and update spent budget amount
    project = db.query(Project).filter(Project.project_name.like(f"%{claim.project}%") | Project.project_id.like(f"%{claim.project}%")).first()
    if project and project.extended_data:
        try:
            data = json.loads(project.extended_data)
            data["spent"] = (data.get("spent") or 0) + claim.amount
            project.extended_data = json.dumps(data)
        except Exception:
            pass
            
    db.commit()
    return {"success": True, "message": "Claim approved, funds released"}


@router.post("/verification-requests/{request_id}/reject")
def reject_request(request_id: str):
    db = get_db()
    claim = db.query(VerificationRequest).filter(VerificationRequest.request_id == request_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Verification request claim not found")
        
    claim.status = "Rejected"
    db.commit()
    return {"success": True, "message": "Claim rejected"}


# --- Field Inspections ---

@router.get("/field-inspections")
def get_field_inspections():
    db = get_db()
    return db.query(FieldInspection).all()


@router.post("/field-inspections")
def create_field_inspection(fi_data: dict):
    db = get_db()
    insp_id = f"FI-{100 + db.query(FieldInspection).count()}"
    new_fi = FieldInspection(
        inspection_id=insp_id,
        project=fi_data.get("project"),
        officer=fi_data.get("officer") or "Unassigned",
        scheduled_date=fi_data.get("scheduledDate"),
        milestone=fi_data.get("milestone"),
        status="Scheduled" if fi_data.get("officer") else "Pending Assignment"
    )
    db.add(new_fi)
    db.commit()
    db.refresh(new_fi)
    return new_fi


# --- AI Threshold Sliders ---

@router.get("/ai-config")
def get_ai_config():
    db = get_db()
    config = db.query(AIConfig).first()
    if not config:
        config = AIConfig(
            satellite_confidence=85,
            material_deviation_threshold=15,
            geotag_radius_tolerance=50,
            contractor_risk_threshold=70
        )
        db.add(config)
        db.commit()
        db.refresh(config)
        
    return {
        "satelliteConfidence": config.satellite_confidence,
        "materialDeviationThreshold": config.material_deviation_threshold,
        "geotagRadiusTolerance": config.geotag_radius_tolerance,
        "contractorRiskThreshold": config.contractor_risk_threshold
    }


@router.post("/ai-config")
def save_ai_config(req: AIConfigRequest):
    db = get_db()
    config = db.query(AIConfig).first()
    if not config:
        config = AIConfig()
        db.add(config)
        
    config.satellite_confidence = req.satelliteConfidence
    config.material_deviation_threshold = req.materialDeviationThreshold
    config.geotag_radius_tolerance = req.geotagRadiusTolerance
    config.contractor_risk_threshold = req.contractorRiskThreshold
    
    db.commit()
    return {"success": True}


# --- Anomalies (Audit Flags) ---

@router.get("/anomalies")
def get_anomalies():
    db = get_db()
    return db.query(Anomaly).all()


@router.post("/anomalies/{anomaly_id}/respond")
def respond_to_anomaly(anomaly_id: str, req: AnomalyResponseRequest):
    db = get_db()
    an = db.query(Anomaly).filter(Anomaly.anomaly_id == anomaly_id).first()
    if not an:
        raise HTTPException(status_code=404, detail="Anomaly flag record not found")
        
    an.response = req.response
    an.status = "Investigating"
    db.commit()
    return {"success": True, "message": "Clarification response logged"}


@router.post("/anomalies/{anomaly_id}/status")
def update_anomaly_status(anomaly_id: str, req: AnomalyStatusRequest):
    db = get_db()
    an = db.query(Anomaly).filter(Anomaly.anomaly_id == anomaly_id).first()
    if not an:
        raise HTTPException(status_code=404, detail="Anomaly flag record not found")
    an.status = req.status
    db.commit()
    return {"success": True, "message": f"Anomaly status updated to {req.status}"}


# --- Report ledgers ---

@router.get("/reports")
def get_reports():
    db = get_db()
    return db.query(Report).all()


# --- Project Updates & Progress Notes ---

@router.post("/projects/{project_id}/updates")
def add_project_update(project_id: str, req: ProjectUpdateRequest):
    db = get_db()
    
    # Log progress note
    import datetime
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    new_up = ProjectUpdate(
        project_id=project_id,
        note=req.note,
        timestamp=now
    )
    db.add(new_up)
    
    # Update project completion percentage in extended JSON
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if project and project.extended_data:
        try:
            data = json.loads(project.extended_data)
            if req.completion is not None:
                data["completion"] = req.completion
                project.completion = req.completion
            data["lastUpdated"] = now
            project.extended_data = json.dumps(data)
        except Exception:
            pass
            
    db.commit()
    return {"success": True}


@router.get("/projects/{project_id}/updates")
def get_project_updates(project_id: str):
    db = get_db()
    return db.query(ProjectUpdate).filter(ProjectUpdate.project_id == project_id).all()


# --- Completion Reports ---

@router.post("/completion-reports")
def submit_completion_report(req: CompletionReportRequest):
    db = get_db()
    
    # Generate report record in database
    import datetime
    report_id = f"RPT-{100 + db.query(Report).count()}"
    new_rep = Report(
        report_id=report_id,
        title=f"Completion Report — {req.project}",
        format="PDF",
        size="1.5 MB",
        date=req.completedDate,
        officer="Municipal Officer",
        outcome="Under Review",
        notes=req.remarks,
        milestone=req.milestone
    )
    db.add(new_rep)
    
    # Mark corresponding project status as Completed or Awaiting Verification
    project = db.query(Project).filter((Project.project_id == req.project) | (Project.project_name == req.project)).first()
    if project:
        project.status = "Completed"
        if project.extended_data:
            try:
                data = json.loads(project.extended_data)
                data["status"] = "Completed"
                data["completion"] = 100
                project.completion = 100
                project.extended_data = json.dumps(data)
            except Exception:
                pass
                
    db.commit()
    return {"success": True, "report_id": report_id}