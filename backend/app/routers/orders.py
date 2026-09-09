import secrets
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Event, Seat, Order, Ticket, User
from app.schemas import CheckoutRequest, OrderResponse, TicketInfo
from app.auth import require_user

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_ticket_code() -> str:
    return f"TCK-{secrets.token_hex(4).upper()}"

@router.post("/checkout", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def checkout_seats(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    if not payload.seat_ids:
        raise HTTPException(status_code=400, detail="No seats selected for booking")

    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.status != "upcoming":
        raise HTTPException(status_code=400, detail=f"Cannot book tickets for an event with status '{event.status}'")

    # Core Business Rule #1: Check user max_tickets_per_user limit for this event
    existing_user_tickets_count = (
        db.query(Ticket)
        .join(Seat)
        .filter(Seat.event_id == payload.event_id)
        .filter(Ticket.user_id == current_user.id)
        .filter(Ticket.status.in_(["valid", "used"]))
        .count()
    )

    requested_count = len(payload.seat_ids)
    if existing_user_tickets_count + requested_count > event.max_tickets_per_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Limit exceeded: You already have {existing_user_tickets_count} ticket(s) for this event. Maximum allowed per user is {event.max_tickets_per_user}."
        )

    # Validate seat availability
    seats = db.query(Seat).filter(Seat.id.in_(payload.seat_ids), Seat.event_id == payload.event_id).all()
    if len(seats) != len(payload.seat_ids):
        raise HTTPException(status_code=400, detail="One or more selected seats are invalid for this event")
    
    for seat in seats:
        if seat.status != "available":
            raise HTTPException(
                status_code=400,
                detail=f"Seat '{seat.seat_number}' is already booked or unavailable"
            )

    # Calculate total amount
    total_amount = event.ticket_price * len(seats)

    # Create Order
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        payment_mode=payload.payment_mode,
        order_status="confirmed",
        booking_time=datetime.utcnow()
    )
    db.add(new_order)
    db.flush()  # assign new_order.id

    ticket_info_list = []
    for seat in seats:
        seat.status = "booked"  # Mark seat as booked
        t_code = generate_ticket_code()
        ticket = Ticket(
            order_id=new_order.id,
            seat_id=seat.id,
            user_id=current_user.id,
            ticket_code=t_code,
            status="valid"
        )
        db.add(ticket)
        db.flush()

        ticket_info_list.append(TicketInfo(
            ticket_id=ticket.id,
            seat_id=seat.id,
            seat_number=seat.seat_number,
            ticket_code=t_code,
            status="valid"
        ))

    db.commit()

    return OrderResponse(
        id=new_order.id,
        user_id=new_order.user_id,
        event_id=event.id,
        event_name=event.name,
        event_date=event.event_date,
        total_amount=new_order.total_amount,
        payment_mode=new_order.payment_mode,
        order_status=new_order.order_status,
        booking_time=new_order.booking_time,
        tickets=ticket_info_list
    )

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.booking_time.desc()).all()
    results = []
    
    for ord in orders:
        tickets = db.query(Ticket).filter(Ticket.order_id == ord.id).all()
        t_info = []
        event_name = "Unknown Event"
        event_date = datetime.utcnow()
        event_id = 0

        if tickets:
            seat = db.query(Seat).filter(Seat.id == tickets[0].seat_id).first()
            if seat:
                evt = db.query(Event).filter(Event.id == seat.event_id).first()
                if evt:
                    event_name = evt.name
                    event_date = evt.event_date
                    event_id = evt.id

            for t in tickets:
                st = db.query(Seat).filter(Seat.id == t.seat_id).first()
                t_info.append(TicketInfo(
                    ticket_id=t.id,
                    seat_id=t.seat_id,
                    seat_number=st.seat_number if st else "N/A",
                    ticket_code=t.ticket_code,
                    status=t.status
                ))

        results.append(OrderResponse(
            id=ord.id,
            user_id=ord.user_id,
            event_id=event_id,
            event_name=event_name,
            event_date=event_date,
            total_amount=ord.total_amount,
            payment_mode=ord.payment_mode,
            order_status=ord.order_status,
            booking_time=ord.booking_time,
            tickets=t_info
        ))
    return results
