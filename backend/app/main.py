from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app import models
from app.routers import devotees, deities, poojas, bookings, donations, expenses, dashboard, reports

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Temple Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(devotees.router, prefix="/devotees", tags=["devotees"])
app.include_router(deities.router, prefix="/deities", tags=["deities"])
app.include_router(poojas.router, prefix="/poojas", tags=["poojas"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(donations.router, prefix="/donations", tags=["donations"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])


@app.on_event("startup")
def seed_data():
    db = SessionLocal()
    try:
        # Seed default deities
        deities_data = [
            {"name": "Bhairaveshwara Swami", "description": "Lord Bhairaveshwara Swami - the fierce manifestation of Lord Shiva"},
            {"name": "Vana Durga Parameshwari", "description": "Goddess Vana Durga Parameshwari - the forest goddess, a form of Shakti"}
        ]
        for d in deities_data:
            existing = db.query(models.Deity).filter(models.Deity.name == d["name"]).first()
            if not existing:
                deity = models.Deity(**d)
                db.add(deity)

        # Seed default pooja services (only if none exist)
        if db.query(models.PoojaService).count() == 0:
            default_poojas = [
                {"name": "Archana", "description": "Sacred Archana pooja offering", "amount": 51.0},
                {"name": "Abhisheka", "description": "Holy Abhisheka with milk, honey, and water", "amount": 251.0},
                {"name": "Special Pooja", "description": "Special pooja for special occasions", "amount": 501.0},
                {"name": "Rudrabhisheka", "description": "Sacred Rudrabhisheka to Lord Shiva", "amount": 1001.0},
                {"name": "Kumkum Archane", "description": "Kumkum Archane to Goddess Durga", "amount": 101.0},
                {"name": "Durga Pooja", "description": "Special Durga Pooja to Goddess", "amount": 751.0},
            ]
            # Get deities
            bhairava = db.query(models.Deity).filter(models.Deity.name == "Bhairaveshwara Swami").first()
            durga = db.query(models.Deity).filter(models.Deity.name == "Vana Durga Parameshwari").first()
            assignments = [bhairava, bhairava, bhairava, bhairava, durga, durga]
            for i, p in enumerate(default_poojas):
                count = db.query(models.PoojaService).count()
                pooja_id = f"POO{count + 1:03d}"
                deity = assignments[i]
                ps = models.PoojaService(
                    pooja_id=pooja_id,
                    deity_id=deity.id if deity else None,
                    **p
                )
                db.add(ps)
                db.flush()

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Seeding error: {e}")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Temple Management System API is running"}
