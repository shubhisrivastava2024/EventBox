from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ticket, Seat, Event, User, Order
from app.schemas import TicketValidateRequest, TicketValidateResponse, TicketInfo
from app.auth import require_user, require_roles

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.post("/validate", response_model=TicketValidateResponse)
def validate_ticket(
    payload: TicketValidateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["entry_manager", "admin"]))
):
    code = payload.ticket_code.strip().upper()
    ticket = db.query(Ticket).filter(Ticket.ticket_code == code).first()

    if not ticket:
        return TicketValidateResponse(
            success=False,
            status="invalid",
            message="Invalid ticket code. No matching ticket found.",
            ticket_code=code
        )

    user = db.query(User).filter(User.id == ticket.user_id).first()
    seat = db.query(Seat).filter(Seat.id == ticket.seat_id).first()
    event = db.query(Event).filter(Event.id == seat.event_id).first() if seat else None

    # Core Business Rule #2:
    # Entry Manager validates ticket_code. If valid, mark status as 'used'. If already used, reject.
    if ticket.status == "used":
        return TicketValidateResponse(
            success=False,
            status="used",
            message="ACCESS DENIED: Ticket has ALREADY been used/scanned!",
            ticket_code=ticket.ticket_code,
            event_name=event.name if event else None,
            event_date=event.event_date if event else None,
            user_name=user.name if user else None,
            seat_number=seat.seat_number if seat else None
        )

    if ticket.status == "cancelled":
        return TicketValidateResponse(
            success=False,
            status="cancelled",
            message="ACCESS DENIED: Ticket was CANCELLED / REFUNDED!",
            ticket_code=ticket.ticket_code,
            event_name=event.name if event else None,
            event_date=event.event_date if event else None,
            user_name=user.name if user else None,
            seat_number=seat.seat_number if seat else None
        )

    if ticket.status == "valid":
        ticket.status = "used"
        db.commit()

        return TicketValidateResponse(
            success=True,
            status="valid",
            message="ACCESS GRANTED: Ticket validated successfully!",
            ticket_code=ticket.ticket_code,
            event_name=event.name if event else None,
            event_date=event.event_date if event else None,
            user_name=user.name if user else None,
            seat_number=seat.seat_number if seat else None
        )

    return TicketValidateResponse(
        success=False,
        status="invalid",
        message=f"Ticket status is '{ticket.status}'",
        ticket_code=ticket.ticket_code
    )

@router.get("/my-tickets", response_model=List[dict])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    tickets = db.query(Ticket).filter(Ticket.user_id == current_user.id).order_by(Ticket.id.desc()).all()
    results = []

    for t in tickets:
        seat = db.query(Seat).filter(Seat.id == t.seat_id).first()
        event = db.query(Event).filter(Event.id == seat.event_id).first() if seat else None

        results.append({
            "ticket_id": t.id,
            "order_id": t.order_id,
            "ticket_code": t.ticket_code,
            "status": t.status,
            "seat_number": seat.seat_number if seat else "N/A",
            "event_id": event.id if event else 0,
            "event_name": event.name if event else "Unknown Event",
            "event_date": event.event_date if event else None,
            "ticket_price": event.ticket_price if event else 0.0,
            "venue_id": event.venue_id if event else 0
        })
    return results
