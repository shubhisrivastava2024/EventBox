from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, venues, events, orders, tickets, support
from app.seed import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Online Event Ticket Booking API",
    description="Backend API for 3-Day Hackathon Event Booking Platform",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(venues.router)
app.include_router(events.router)
app.include_router(orders.router)
app.include_router(tickets.router)
app.include_router(support.router)

@app.on_event("startup")
def startup_event():
    seed_database()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "Online Event Ticket Booking Platform",
        "docs_url": "/docs"
    }
