import json
import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from databases.database import SessionLocal
from models.models import (
    Project, AuditAssignment, VerificationRequest, FieldInspection,
    AIConfig, Anomaly, Report, ProjectUpdate,
    Contractor, Scheme, BudgetAllocations, ActivityFeedItem, AuditLog, Notification, User
)

router = APIRouter()

# Helper function to get db session per request
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


def log_audit_event(db, actor: str, actor_type: str, action: str, entity: str, entity_name: str, detail: str, severity: str):
    import datetime
    try:
        db_log = AuditLog(
            id=f"LOG-{int(datetime.datetime.now().timestamp()*1000)}",
            timestamp=datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            actor=actor,
            actor_type=actor_type,
            action=action,
            entity=entity,
            entity_name=entity_name,
            detail=detail,
            severity=severity
        )
        db.add(db_log)
    except Exception as e:
        print(f"Error logging audit event: {e}")


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
        data = {}
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
            except Exception:
                pass
                
        project_id = p.project_id or data.get("id") or f"PRJ-{p.id}"
        project_name = p.project_name or data.get("name") or "Infrastructure Project"
        scheme = p.scheme or data.get("scheme") or "PMGSY"
        
        scheme_map = {
            'PMGSY': 'pmgsy', 'MGNREGA': 'mgnrega', 'JJM': 'jjm',
            'PMAY': 'pmay', 'Smart Cities': 'smart', 'AMRUT': 'amrut'
        }
        scheme_id = data.get("schemeId") or scheme_map.get(scheme, 'pmgsy')
        
        final_proj = {
            "id": project_id,
            "name": project_name,
            "scheme": scheme,
            "schemeId": scheme_id,
            "state": p.state or data.get("state") or "State",
            "district": p.district or data.get("district") or "District",
            "village": data.get("village") or p.district or "Village/Taluk",
            "status": p.status or data.get("status") or "Registered",
            "budget": float(p.budget or data.get("budget") or 0),
            "spent": float(data.get("spent") or 0),
            "completion": int(data.get("completion") or 0),
            "startDate": data.get("startDate") or "2026-07-01",
            "expectedEnd": data.get("expectedEnd") or "2026-12-31",
            "lastUpdated": data.get("lastUpdated") or "",
            "contractor": data.get("contractor") or "Not Assigned",
            "contractorId": data.get("contractorId") or "",
            "coordinates": data.get("coordinates") or [20.5937, 78.9629],
            "riskScore": data.get("riskScore") or "Low",
            "flagged": data.get("flagged") or False,
            "description": data.get("description") or "",
            "disbursements": data.get("disbursements") or [],
            "timeline": data.get("timeline") or [],
            "trustScore": data.get("trustScore") or 82,
            "aiMonitoringStatus": data.get("aiMonitoringStatus") or "Active",
            "baselineSatelliteStatus": data.get("baselineSatelliteStatus") or "Captured",
            "digitalPassport": data.get("digitalPassport") or True,
            "db_id": p.id
        }
        result.append(final_proj)
        
    return result


@router.get("/projects/{project_id}")
def get_project(project_id: str):
    db = get_db()
    p = db.query(Project).filter((Project.project_id == project_id) | (Project.id == project_id)).first()
    
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
        
    data = {}
    if p.extended_data:
        try:
            data = json.loads(p.extended_data)
        except Exception:
            pass
            
    project_id_val = p.project_id or data.get("id") or f"PRJ-{p.id}"
    project_name = p.project_name or data.get("name") or "Infrastructure Project"
    scheme = p.scheme or data.get("scheme") or "PMGSY"
    
    scheme_map = {
        'PMGSY': 'pmgsy', 'MGNREGA': 'mgnrega', 'JJM': 'jjm',
        'PMAY': 'pmay', 'Smart Cities': 'smart', 'AMRUT': 'amrut'
    }
    scheme_id = data.get("schemeId") or scheme_map.get(scheme, 'pmgsy')
    
    return {
        "id": project_id_val,
        "name": project_name,
        "scheme": scheme,
        "schemeId": scheme_id,
        "state": p.state or data.get("state") or "State",
        "district": p.district or data.get("district") or "District",
        "village": data.get("village") or p.district or "Village/Taluk",
        "status": p.status or data.get("status") or "Registered",
        "budget": float(p.budget or data.get("budget") or 0),
        "spent": float(data.get("spent") or 0),
        "completion": int(data.get("completion") or 0),
        "startDate": data.get("startDate") or "2026-07-01",
        "expectedEnd": data.get("expectedEnd") or "2026-12-31",
        "lastUpdated": data.get("lastUpdated") or "",
        "contractor": data.get("contractor") or "Not Assigned",
        "contractorId": data.get("contractorId") or "",
        "coordinates": data.get("coordinates") or [20.5937, 78.9629],
        "riskScore": data.get("riskScore") or "Low",
        "flagged": data.get("flagged") or False,
        "description": data.get("description") or "",
        "disbursements": data.get("disbursements") or [],
        "timeline": data.get("timeline") or [],
        "trustScore": data.get("trustScore") or 82,
        "aiMonitoringStatus": data.get("aiMonitoringStatus") or "Active",
        "baselineSatelliteStatus": data.get("baselineSatelliteStatus") or "Captured",
        "digitalPassport": data.get("digitalPassport") or True,
        "db_id": p.id
    }


def verify_project_for_anomalies(project_name: str, scheme: str, budget: float, state: str, coordinates: list, documents: dict, description: str) -> list:
    anomalies = []
    
    # 1. GIS GPS Boundary Check
    if coordinates and len(coordinates) == 2:
        try:
            lat, lon = float(coordinates[0]), float(coordinates[1])
            # General India Bounding Box check
            if not (8.0 <= lat <= 38.0 and 68.0 <= lon <= 98.0):
                anomalies.append({
                    "check_type": "GPS Boundary Deviation",
                    "detail": f"Coordinates [{lat:.4f}, {lon:.4f}] are outside India borders. Possible spoofing detected.",
                    "confidence": 98,
                    "severity": "Critical"
                })
            else:
                # State-specific boundary check
                state_lower = (state or "").lower()
                if "maharashtra" in state_lower:
                    if not (15.0 <= lat <= 22.5 and 72.0 <= lon <= 81.0):
                        anomalies.append({
                            "check_type": "GPS Boundary Deviation",
                            "detail": f"Coordinates [{lat:.4f}, {lon:.4f}] lie outside the administrative boundary of Maharashtra.",
                            "confidence": 94,
                            "severity": "High"
                        })
                elif "tamil" in state_lower:
                    if not (8.0 <= lat <= 14.0 and 76.0 <= lon <= 80.5):
                        anomalies.append({
                            "check_type": "GPS Boundary Deviation",
                            "detail": f"Coordinates [{lat:.4f}, {lon:.4f}] lie outside the administrative boundary of Tamil Nadu.",
                            "confidence": 94,
                            "severity": "High"
                        })
                elif "delhi" in state_lower:
                    if not (28.4 <= lat <= 28.9 and 76.8 <= lon <= 77.4):
                        anomalies.append({
                            "check_type": "GPS Boundary Deviation",
                            "detail": f"Coordinates [{lat:.4f}, {lon:.4f}] lie outside the administrative boundary of Delhi NCR.",
                            "confidence": 96,
                            "severity": "High"
                        })
        except Exception:
            anomalies.append({
                "check_type": "GPS Parse Failure",
                "detail": "Supplied coordinates are invalid or could not be parsed as floats.",
                "confidence": 90,
                "severity": "Medium"
            })
    else:
        anomalies.append({
            "check_type": "GPS Missing",
            "detail": "GPS coordinates not supplied. Geofencing checks skipped.",
            "confidence": 90,
            "severity": "Medium"
        })

    # 2. Semantic consistency (NLP Verification)
    desc_lower = (description or "").lower() + " " + (project_name or "").lower()
    scheme_upper = (scheme or "").upper()
    
    if "JJM" in scheme_upper or "WATER" in desc_lower or "PIPELINE" in desc_lower:
        water_keywords = ["water", "pipe", "pump", "jal", "supply", "tank", "tap", "borewell", "pipeline", "filtration", "jjm"]
        if not any(kw in desc_lower for kw in water_keywords):
            anomalies.append({
                "check_type": "Scheme-Description Mismatch",
                "detail": "Registered under Jal Jeevan Mission (JJM) but description lacks water supply or pipeline terminology.",
                "confidence": 88,
                "severity": "High"
            })
            
    if "PMGSY" in scheme_upper or "ROAD" in desc_lower or "BRIDGE" in desc_lower or "HIGHWAY" in desc_lower:
        road_keywords = ["road", "bridge", "path", "concrete", "tarmac", "highway", "pmgsy", "asphalt", "pavement", "lane", "culvert"]
        if not any(kw in desc_lower for kw in road_keywords):
            anomalies.append({
                "check_type": "Scheme-Description Mismatch",
                "detail": "Registered under PMGSY but description lacks road construction or paving terminology.",
                "confidence": 88,
                "severity": "High"
            })

    if "PMAY" in scheme_upper or "HOUSING" in desc_lower or "HOUSE" in desc_lower:
        house_keywords = ["house", "home", "awas", "housing", "pmay", "roof", "wall", "flat", "room", "residential"]
        if not any(kw in desc_lower for kw in house_keywords):
            anomalies.append({
                "check_type": "Scheme-Description Mismatch",
                "detail": "Registered under PMAY (Housing) but description lacks residential or housing construction terminology.",
                "confidence": 88,
                "severity": "High"
            })

    # 3. Budget Outlier (Financial Verification)
    if "JJM" in scheme_upper and budget > 100000000: # JJM > 10 Crores is outlier
        anomalies.append({
            "check_type": "Financial Outlier",
            "detail": f"Budget of Rs. {budget/10000000:.1f} Cr exceeds the standard cap for Jal Jeevan village pipeline schemes.",
            "confidence": 91,
            "severity": "Medium"
        })
    elif "PMAY" in scheme_upper and budget > 20000000: # PMAY > 2 Crores is outlier
        anomalies.append({
            "check_type": "Financial Outlier",
            "detail": f"Budget of Rs. {budget/100000:.1f} L exceeds standard PMAY benchmarks for residential construction units.",
            "confidence": 93,
            "severity": "High"
        })

    # 4. Document / Photo Sanity Checks
    if documents:
        for doc_key, doc_val in documents.items():
            if isinstance(doc_val, dict):
                name = (doc_val.get("name") or "").lower()
                size = doc_val.get("size") or 0
                
                # Check for placeholder filenames
                suspicious_terms = ["mock", "test", "placeholder", "dummy", "empty"]
                if any(term in name for term in suspicious_terms):
                    anomalies.append({
                        "check_type": "Suspicious Document Upload",
                        "detail": f"Uploaded baseline document '{doc_val.get('name')}' detected as a placeholder/mock file.",
                        "confidence": 97,
                        "severity": "Critical"
                    })
                # Check for abnormally small files (empty files under 15KB)
                elif size > 0 and size < 15000:
                    anomalies.append({
                        "check_type": "Invalid Document Resolution",
                        "detail": f"Uploaded document '{doc_val.get('name')}' is too small ({size/1024:.1f} KB), failing resolution check.",
                        "confidence": 89,
                        "severity": "Medium"
                    })
                    
    return anomalies


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
    contractor_id = project_data.get("contractorId") or f"CNT-{1000 + db.query(Contractor).count()}"
    
    # Auto-register contractor if not already in the database
    existing_c = db.query(Contractor).filter(Contractor.id == contractor_id).first()
    if not existing_c:
        existing_c = db.query(Contractor).filter(Contractor.name == contractor_name).first()
        
    if not existing_c:
        import random
        new_c = Contractor(
            id=contractor_id,
            name=contractor_name,
            registration=f"REG/{state[:2].upper() if state else 'IN'}/{datetime.datetime.now().year}/{random.randint(1000, 9999)}",
            pan=f"AABCP{random.randint(1000, 9999)}Q",
            gstin=f"27AABCP{random.randint(1000, 9999)}Q1ZM",
            state=state or "Maharashtra",
            active_projects=1,
            completed_projects=0,
            total_contract_value=budget,
            risk_score="Low",
            verification_status="Verified",
            last_verified=datetime.datetime.now().strftime("%Y-%m-%d"),
            payment_rating=4.5,
            red_flags="[]",
            specializations=json.dumps([project_data.get("projectType") or "Civil Works"])
        )
        db.add(new_c)
        
    # Update project_data and re-dump to contain correct contractor info
    project_data["contractor"] = contractor_name
    project_data["contractorId"] = contractor_id
    new_project.extended_data = json.dumps(project_data)
    
    # 1. Create a simulated VerificationRequest (disbursement claim)
    claim_id = f"VR-{project_id.split('-')[-1]}"
    new_claim = VerificationRequest(
        request_id=claim_id,
        project=project_name,
        contractor=contractor_name,
        amount=budget, # 100% of project budget as requested
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
    
    # 3. Perform REAL Rule-based AI Verification Checks on project parameters
    detected_anomalies = verify_project_for_anomalies(
        project_name=project_name,
        scheme=scheme,
        budget=budget,
        state=state,
        coordinates=project_data.get("coordinates"),
        documents=project_data.get("documents"),
        description=project_data.get("description", "")
    )
    
    # Save any validation discrepancies as anomalies in the database
    for idx, anom in enumerate(detected_anomalies):
        anom_id = f"ANM-{project_id.split('-')[-1]}-{idx+1}"
        new_anomaly = Anomaly(
            anomaly_id=anom_id,
            project=project_name,
            check_type=anom["check_type"],
            detail=anom["detail"],
            confidence=anom["confidence"],
            status="Flagged",
            severity=anom["severity"],
            deadline=(datetime.datetime.now() + datetime.timedelta(days=7)).strftime("%Y-%m-%d")
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
                
    budget_utilization = round((total_spent / total_budget * 100), 1) if total_budget > 0 else 0.0
    
    total_users = db.query(User).count()
    total_contractors = db.query(Contractor).count()
    flagged_contractors = db.query(Contractor).filter(Contractor.risk_score == "High").count()
    verified_contractors = db.query(Contractor).filter(Contractor.verification_status == "Verified").count()
    reports_count = db.query(Report).count()
    inspections_count = db.query(FieldInspection).count()
    
    role_kpi = {
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
        "totalUsers": total_users,
        "reportsCount": reports_count,
        "inspectionsScheduled": inspections_count,
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
    projects = db.query(Project).all()
    
    result = []
    for c in contractors:
        assigned_projs = []
        for p in projects:
            p_data = {}
            if p.extended_data:
                try:
                    p_data = json.loads(p.extended_data)
                except Exception:
                    pass
            p_c_id = p_data.get("contractorId")
            p_c_name = p_data.get("contractor") or p_data.get("contractorName")
            
            if p_c_id == c.id or (p_c_name and p_c_name.lower() == c.name.lower()):
                assigned_projs.append(p)
                
        active_count = sum(1 for p in assigned_projs if p.status in ["In Progress", "Registered"])
        completed_count = sum(1 for p in assigned_projs if p.status == "Completed")
        total_val = sum(p.budget for p in assigned_projs)
        
        result.append({
            "id": c.id,
            "name": c.name,
            "registration": c.registration,
            "pan": c.pan,
            "gstin": c.gstin,
            "state": c.state,
            "activeProjects": active_count if len(assigned_projs) > 0 else c.active_projects,
            "completedProjects": completed_count if len(assigned_projs) > 0 else c.completed_projects,
            "totalContractValue": total_val if len(assigned_projs) > 0 else c.total_contract_value,
            "riskScore": c.risk_score,
            "verificationStatus": c.verification_status,
            "lastVerified": c.last_verified,
            "paymentRating": c.payment_rating,
            "redFlags": json.loads(c.red_flags or "[]"),
            "specializations": json.loads(c.specializations or "[]")
        })
    return result


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
                
    log_audit_event(
        db=db,
        actor="Ranjit Kumar Sahu",
        actor_type="CAG Auditor",
        action="Audit Completed",
        entity=task_id,
        entity_name=task.project_name,
        detail=f"National ledger audit completed and verified for project {task.project_name}.",
        severity="success"
    )
            
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
            
    log_audit_event(
        db=db,
        actor="Sunil Patkar (IAS)",
        actor_type="District Collector",
        action="Claim Approved",
        entity=request_id,
        entity_name=claim.project,
        detail=f"Disbursement claim of Rs. {claim.amount/100000:.1f} L approved for {claim.stage}.",
        severity="success"
    )
            
    db.commit()
    return {"success": True, "message": "Claim approved, funds released"}


@router.post("/verification-requests/{request_id}/reject")
def reject_request(request_id: str):
    db = get_db()
    claim = db.query(VerificationRequest).filter(VerificationRequest.request_id == request_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Verification request claim not found")
        
    claim.status = "Rejected"
    
    log_audit_event(
        db=db,
        actor="Sunil Patkar (IAS)",
        actor_type="District Collector",
        action="Claim Rejected",
        entity=request_id,
        entity_name=claim.project,
        detail=f"Disbursement claim of Rs. {claim.amount/100000:.1f} L rejected for {claim.stage}.",
        severity="danger"
    )
    
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
    
    log_audit_event(
        db=db,
        actor="Municipal Officer",
        actor_type="Municipal Officer",
        action="Anomaly Clarification Submitted",
        entity=anomaly_id,
        entity_name=an.project,
        detail=f"Clarification response logged for anomaly flag {anomaly_id}.",
        severity="info"
    )
    
    db.commit()
    return {"success": True, "message": "Clarification response logged"}


@router.post("/anomalies/{anomaly_id}/status")
def update_anomaly_status(anomaly_id: str, req: AnomalyStatusRequest):
    db = get_db()
    an = db.query(Anomaly).filter(Anomaly.anomaly_id == anomaly_id).first()
    if not an:
        raise HTTPException(status_code=404, detail="Anomaly flag record not found")
    an.status = req.status
    
    log_audit_event(
        db=db,
        actor="Demo User",
        actor_type="State Audit Officer",
        action="Anomaly Status Updated",
        entity=anomaly_id,
        entity_name=an.project,
        detail=f"AI anomaly status updated to {req.status}.",
        severity="warning"
    )
    
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
            data["lastUpdated"] = now
            project.extended_data = json.dumps(data)
        except Exception:
            pass
            
    log_audit_event(
        db=db,
        actor="Amit Deshmukh",
        actor_type="Municipal Officer",
        action="Progress Updated",
        entity=project_id,
        entity_name=project.project_name if project else "Project",
        detail=req.note or f"Completion percentage updated to {req.completion}%.",
        severity="info"
    )
            
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
                project.extended_data = json.dumps(data)
            except Exception:
                pass
                
    log_audit_event(
        db=db,
        actor="Amit Deshmukh",
        actor_type="Municipal Officer",
        action="Completion Report Submitted",
        entity=req.project,
        entity_name=project.project_name if project else req.project,
        detail=req.remarks or "Milestone verification requested.",
        severity="info"
    )
                
    db.commit()
    return {"success": True, "report_id": report_id}