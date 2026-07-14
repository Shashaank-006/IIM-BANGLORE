from databases.database import SessionLocal
from models.models import User

db = SessionLocal()

users = [
    User(
        name="Joint Secretary",
        email="js@gov.in",
        password="1234",
        role="Joint Secretary"
    ),

    User(
        name="CAG Officer",
        email="cag@gov.in",
        password="1234",
        role="CAG Auditor"
    ),

    User(
        name="State Officer",
        email="state@gov.in",
        password="1234",
        role="State Audit Officer"
    ),

    User(
        name="District Collector",
        email="collector@gov.in",
        password="1234",
        role="District Collector"
    ),

    User(
        name="Municipal Officer",
        email="municipal@gov.in",
        password="1234",
        role="Municipal Officer"
    )
]

for user in users:

    existing = db.query(User).filter(User.email == user.email).first()

    if not existing:
        db.add(user)

db.commit()

print("Users Added Successfully!")