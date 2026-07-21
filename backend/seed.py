from databases.database import SessionLocal, engine
from models.models import Base
from databases.seeder import seed_database

# Recreate database tables to apply schema modifications (clean empty slate)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Seed default users, schemes, and contractors
seed_database()

print("Database Reset & Seeding Completed Successfully!")