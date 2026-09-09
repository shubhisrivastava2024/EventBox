from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Venue, User
from app.schemas import VenueCreate, VenueResponse
from app.auth import require_roles

router = APIRouter(prefix="/venues", tags=["Venues"])

@router.post("", response_model=VenueResponse, status_code=status.HTTP_201_CREATED)
def create_venue(
    payload: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "organizer"]))
):
    new_venue = Venue(
        name=payload.name,
        city=payload.city,
        address=payload.address,
        total_capacity=payload.total_capacity
    )
    db.add(new_venue)
    db.commit()
    db.refresh(new_venue)
    return new_venue

@router.get("", response_model=List[VenueResponse])
def list_venues(db: Session = Depends(get_db)):
    return db.query(Venue).all()
