from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SupportCase, Order, Ticket, Seat, Event, User
from app.schemas import SupportCaseCreate, RefundApproveRequest, SupportCaseResponse
from app.auth import require_user, require_roles

router = APIRouter(prefix="/support", tags=["Support"])

@router.post("/cases", status_code=status.HTTP_201_CREATED)
def create_support_case(
    payload: SupportCaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    order = db.query(Order).filter(Order.id == payload.order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    existing_case = db.query(SupportCase).filter(
        SupportCase.order_id == payload.order_id,
        SupportCase.status == "open"
    ).first()
    if existing_case:
        raise HTTPException(status_code=400, detail="An open support request already exists for this order")

    new_case = SupportCase(
        user_id=current_user.id,
        order_id=payload.order_id,
        type=payload.type,
        status="open",
        resolution_notes=payload.reason or "Customer requested refund/support"
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return {"message": "Support case created successfully", "case_id": new_case.id}

@router.get("/cases", response_model=List[SupportCaseResponse])
def get_support_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["support", "admin"]))
):
    cases = db.query(SupportCase).order_by(SupportCase.created_at.desc()).all()
    results = []

    for case in cases:
        user = db.query(User).filter(User.id == case.user_id).first()
        order = db.query(Order).filter(Order.id == case.order_id).first()
        
        event_name = "Unknown Event"
        event_date = datetime.utcnow()
        if order:
            tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
            if tickets:
                seat = db.query(Seat).filter(Seat.id == tickets[0].seat_id).first()
                if seat:
                    evt = db.query(Event).filter(Event.id == seat.event_id).first()
                    if evt:
                        event_name = evt.name
                        event_date = evt.event_date

        results.append(SupportCaseResponse(
            id=case.id,
            user_id=case.user_id,
            user_name=user.name if user else "Unknown User",
            user_email=user.email if user else "N/A",
            order_id=case.order_id,
            event_name=event_name,
            event_date=event_date,
            order_total=order.total_amount if order else 0.0,
            type=case.type,
            status=case.status,
            resolution_notes=case.resolution_notes,
            created_at=case.created_at
        ))
    return results

@router.post("/refund/approve")
def approve_refund(
    payload: RefundApproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["support", "admin"]))
):
    case = db.query(SupportCase).filter(SupportCase.id == payload.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Support case not found")

    order = db.query(Order).filter(Order.id == case.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tickets = db.query(Ticket).filter(Ticket.order_id == order.id).all()
    if not tickets:
        raise HTTPException(status_code=400, detail="No tickets found for this order")

    # Fetch Event to check event_date
    first_seat = db.query(Seat).filter(Seat.id == tickets[0].seat_id).first()
    if not first_seat:
        raise HTTPException(status_code=400, detail="Seat information missing for tickets")

    event = db.query(Event).filter(Event.id == first_seat.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Core Business Rule #3: Refunds allowed only BEFORE event date.
    now = datetime.utcnow()
    if event.event_date < now:
        case.status = "rejected"
        case.resolution_notes = f"Rejected automatically: Event date ({event.event_date.strftime('%Y-%m-%d %H:%M')}) has already passed."
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Refund denied: Event date ({event.event_date.strftime('%Y-%m-%d')}) has already passed. Refunds are only allowed BEFORE event date."
        )

    if payload.action == "reject":
        case.status = "rejected"
        case.resolution_notes = payload.notes or "Refund request rejected by support agent."
        db.commit()
        return {"message": "Refund request rejected", "case_id": case.id}

    # Execute Approval:
    # 1. Order status = refunded
    # 2. Ticket status = cancelled
    # 3. Seat status resets to 'available'
    order.order_status = "refunded"
    
    for t in tickets:
        t.status = "cancelled"
        st = db.query(Seat).filter(Seat.id == t.seat_id).first()
        if st:
            st.status = "available"  # Reset seat status to available

    case.status = "resolved"
    case.resolution_notes = payload.notes or "Refund approved successfully. Amount refunded and seats made available."

    db.commit()

    return {
        "message": "Refund approved successfully! Order marked as refunded, tickets cancelled, and seats restored to available.",
        "case_id": case.id,
        "order_id": order.id,
        "refunded_amount": order.total_amount
    }
