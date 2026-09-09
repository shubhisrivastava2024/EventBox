from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Auth Schemas
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "customer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

# Venue Schemas
class VenueCreate(BaseModel):
    name: str
    city: str
    address: str
    total_capacity: int

class VenueResponse(BaseModel):
    id: int
    name: str
    city: str
    address: str
    total_capacity: int

    class Config:
        from_attributes = True

# Event Schemas
class EventCreate(BaseModel):
    venue_id: int
    name: str
    category: str
    event_date: datetime
    ticket_price: float
    max_tickets_per_user: int = 5
    total_seats_to_generate: Optional[int] = None  # defaults to venue total_capacity if None

class EventResponse(BaseModel):
    id: int
    venue_id: int
    name: str
    category: str
    event_date: datetime
    ticket_price: float
    max_tickets_per_user: int
    status: str
    venue_name: Optional[str] = None
    city: Optional[str] = None
    available_seats_count: Optional[int] = None
    total_seats_count: Optional[int] = None

    class Config:
        from_attributes = True

# Seat Schemas
class SeatResponse(BaseModel):
    id: int
    event_id: int
    seat_number: str
    status: str

    class Config:
        from_attributes = True

# Order & Checkout Schemas
class CheckoutRequest(BaseModel):
    event_id: int
    seat_ids: List[int]
    payment_mode: str = "credit_card"  # credit_card, upi, netbanking

class TicketInfo(BaseModel):
    ticket_id: int
    seat_id: int
    seat_number: str
    ticket_code: str
    status: str

class OrderResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    event_name: str
    event_date: datetime
    total_amount: float
    payment_mode: str
    order_status: str
    booking_time: datetime
    tickets: List[TicketInfo]

    class Config:
        from_attributes = True

# Ticket Validation Schemas
class TicketValidateRequest(BaseModel):
    ticket_code: str

class TicketValidateResponse(BaseModel):
    success: bool
    status: str  # valid, used, cancelled, invalid
    message: str
    ticket_code: Optional[str] = None
    event_name: Optional[str] = None
    event_date: Optional[datetime] = None
    user_name: Optional[str] = None
    seat_number: Optional[str] = None

# Support & Refund Schemas
class SupportCaseCreate(BaseModel):
    order_id: int
    type: str  # complaint, refund_request
    reason: Optional[str] = None

class RefundApproveRequest(BaseModel):
    case_id: int
    action: str  # approve, reject
    notes: Optional[str] = None

class SupportCaseResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    order_id: int
    event_name: str
    event_date: datetime
    order_total: float
    type: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
