from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Event, Venue, Seat, User
from app.schemas import EventCreate, EventResponse, SeatResponse
from app.auth import require_roles

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "organizer"]))
):
    venue = db.query(Venue).filter(Venue.id == payload.venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")

    new_event = Event(
        venue_id=payload.venue_id,
        name=payload.name,
        category=payload.category,
        event_date=payload.event_date,
        ticket_price=payload.ticket_price,
        max_tickets_per_user=payload.max_tickets_per_user,
        status="upcoming"
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    # Automatically generate seats for the event
    seat_capacity = payload.total_seats_to_generate or venue.total_capacity
    rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"]
    seats_per_row = 10

    seats_created = 0
    row_idx = 0
    seat_in_row = 1

    seats_list = []
    while seats_created < seat_capacity:
        row_letter = rows[row_idx % len(rows)]
        if row_idx >= len(rows):
            row_letter = f"R{row_idx + 1}"
        seat_num = f"{row_letter}-{seat_in_row}"
        
        seat = Seat(
            event_id=new_event.id,
            seat_number=seat_num,
            status="available"
        )
        seats_list.append(seat)
        seats_created += 1
        seat_in_row += 1
        if seat_in_row > seats_per_row:
            seat_in_row = 1
            row_idx += 1

    db.bulk_save_objects(seats_list)
    db.commit()

    return EventResponse(
        id=new_event.id,
        venue_id=new_event.venue_id,
        name=new_event.name,
        category=new_event.category,
        event_date=new_event.event_date,
        ticket_price=new_event.ticket_price,
        max_tickets_per_user=new_event.max_tickets_per_user,
        status=new_event.status,
        venue_name=venue.name,
        city=venue.city,
        available_seats_count=seat_capacity,
        total_seats_count=seat_capacity
    )

@router.get("", response_model=List[EventResponse])
def list_events(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Event)
    if category:
        query = query.filter(Event.category == category)
    
    events = query.order_by(Event.event_date.asc()).all()
    results = []
    for evt in events:
        venue = db.query(Venue).filter(Venue.id == evt.venue_id).first()
        total_seats = db.query(Seat).filter(Seat.event_id == evt.id).count()
        avail_seats = db.query(Seat).filter(Seat.event_id == evt.id, Seat.status == "available").count()
        
        results.append(EventResponse(
            id=evt.id,
            venue_id=evt.venue_id,
            name=evt.name,
            category=evt.category,
            event_date=evt.event_date,
            ticket_price=evt.ticket_price,
            max_tickets_per_user=evt.max_tickets_per_user,
            status=evt.status,
            venue_name=venue.name if venue else "Unknown Venue",
            city=venue.city if venue else "Unknown City",
            available_seats_count=avail_seats,
            total_seats_count=total_seats
        ))
    return results

@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    evt = db.query(Event).filter(Event.id == event_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    
    venue = db.query(Venue).filter(Venue.id == evt.venue_id).first()
    total_seats = db.query(Seat).filter(Seat.event_id == evt.id).count()
    avail_seats = db.query(Seat).filter(Seat.event_id == evt.id, Seat.status == "available").count()

    return EventResponse(
        id=evt.id,
        venue_id=evt.venue_id,
        name=evt.name,
        category=evt.category,
        event_date=evt.event_date,
        ticket_price=evt.ticket_price,
        max_tickets_per_user=evt.max_tickets_per_user,
        status=evt.status,
        venue_name=venue.name if venue else "Unknown Venue",
        city=venue.city if venue else "Unknown City",
        available_seats_count=avail_seats,
        total_seats_count=total_seats
    )

@router.get("/{event_id}/seats", response_model=List[SeatResponse])
def get_event_seats(event_id: int, db: Session = Depends(get_db)):
    evt = db.query(Event).filter(Event.id == event_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    
    seats = db.query(Seat).filter(Seat.event_id == event_id).order_by(Seat.id.asc()).all()
    return seats
