import json
import datetime
from databases.database import SessionLocal
from models.models import (
    User, Scheme, Contractor, BudgetAllocations, ActivityFeedItem, AuditLog
)
from mock_data.mock_db import (
    SCHEMES, CONTRACTORS, BUDGET_DATA, AUDIT_LOGS, ACTIVITY_FEED
)

MOCK_USERS = [
    {
        "email": "priya.nair@nic.in",
        "password": "GovWatch@2026",
        "name": "Priya Nair",
        "role": "Joint Secretary, Ministry of Rural Development",
        "employeeId": "IAS-TG-012",
        "department": "Ministry of Rural Development"
    },
    {
        "email": "ranjit.sahu@cag.gov.in",
        "password": "Audit@2026",
        "name": "Ranjit Kumar Sahu",
        "role": "CAG Auditor",
        "employeeId": "CAG-CG-045",
        "department": "Comptroller & Auditor General of India"
    },
    {
        "email": "demo@govwatch.gov.in",
        "password": "Demo@1234",
        "name": "Demo User",
        "role": "State Audit Officer",
        "employeeId": "SAO-DL-001",
        "department": "State Finance Department"
    },
    {
        "email": "collector.sindhudurg@nic.in",
        "password": "Collector@2026",
        "name": "Sunil Patkar (IAS)",
        "role": "District Collector",
        "employeeId": "DC-MH-033",
        "department": "District Administration, Sindhudurg"
    },
    {
        "email": "municipal.officer@nic.in",
        "password": "Municipal@2026",
        "name": "Amit Deshmukh",
        "role": "Municipal Officer",
        "employeeId": "MO-MH-402",
        "department": "Malvan Municipal Council"
    }
]

def seed_database():
    db = SessionLocal()
    try:
        # 1. Seed Users
        if db.query(User).count() == 0:
            print("Seeding Users...")
            for u in MOCK_USERS:
                db_user = User(
                    name=u["name"],
                    email=u["email"],
                    password=u["password"],
                    role=u["role"],
                    employee_id=u["employeeId"],
                    department=u["department"]
                )
                db.add(db_user)
            db.commit()

        # 2. Seed Schemes
        if db.query(Scheme).count() == 0:
            print("Seeding Schemes...")
            for s in SCHEMES:
                db_scheme = Scheme(
                    id=s["id"],
                    name=s["name"],
                    full_name=s["fullName"],
                    color=s["color"],
                    budget=s["budget"]
                )
                db.add(db_scheme)
            db.commit()

        # 3. Seed Contractors
        if db.query(Contractor).count() == 0:
            print("Seeding Contractors...")
            for c in CONTRACTORS:
                db_contractor = Contractor(
                    id=c["id"],
                    name=c["name"],
                    registration=c["registration"],
                    pan=c["pan"],
                    gstin=c["gstin"],
                    state=c["state"],
                    active_projects=c["activeProjects"],
                    completed_projects=c["completedProjects"],
                    total_contract_value=c["totalContractValue"],
                    risk_score=c["riskScore"],
                    verification_status=c["verificationStatus"],
                    last_verified=c["lastVerified"],
                    payment_rating=c["paymentRating"],
                    red_flags=json.dumps(c["redFlags"]),
                    specializations=json.dumps(c["specializations"])
                )
                db.add(db_contractor)
            db.commit()

        # 4. Seed Budget Data
        if db.query(BudgetAllocations).count() == 0:
            print("Seeding Budget Data...")
            db_budget = BudgetAllocations(
                central_allocation=BUDGET_DATA["centralAllocation"],
                state_released=BUDGET_DATA["stateReleased"],
                district_disbursed=BUDGET_DATA["districtDisbursed"],
                utilized=BUDGET_DATA["utilized"],
                monthly_trend=json.dumps(BUDGET_DATA["monthlyTrend"]),
                scheme_wise=json.dumps(BUDGET_DATA["schemeWise"]),
                pending_reimbursements=json.dumps(BUDGET_DATA["pendingReimbursements"])
            )
            db.add(db_budget)
            db.commit()

        # 5. Seed Activity Feed
        if db.query(ActivityFeedItem).count() == 0:
            print("Seeding Activity Feed...")
            for a in ACTIVITY_FEED:
                db_feed = ActivityFeedItem(
                    time=a["time"],
                    date=a["date"],
                    actor=a["actor"],
                    action=a["action"],
                    target=a["target"],
                    type=a["type"]
                )
                db.add(db_feed)
            db.commit()

        # 6. Seed Audit Logs (disabled to start clean, session-based logging)
        pass

        print("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
