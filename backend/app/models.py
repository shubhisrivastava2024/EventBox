from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="customer")  # admin, organizer, customer, entry_manager, support

    orders = relationship("Order", back_populates="user")
    tickets = relationship("Ticket", back_populates="user")
    support_cases = relationship("SupportCase", back_populates="user")


class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address = Column(String, nullable=False)
    total_capacity = Column(Integer, nullable=False)

    events = relationship("Event", back_populates="venue")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # Music, Tech, Workshop, Sports, Conference
    event_date = Column(DateTime, nullable=False)
    ticket_price = Column(Float, nullable=False)
    max_tickets_per_user = Column(Integer, default=5, nullable=False)
    status = Column(String, default="upcoming")  # upcoming, closed, cancelled

    venue = relationship("Venue", back_populates="events")
    seats = relationship("Seat", back_populates="event", cascade="all, delete-orphan")


class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    seat_number = Column(String, nullable=False)
    status = Column(String, default="available")  # available, booked

    event = relationship("Event", back_populates="seats")
    tickets = relationship("Ticket", back_populates="seat")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_mode = Column(String, nullable=False)  # credit_card, upi, netbanking
    order_status = Column(String, default="confirmed")  # pending, confirmed, cancelled, refunded
    booking_time = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    tickets = relationship("Ticket", back_populates="order")
    support_cases = relationship("SupportCase", back_populates="order")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    seat_id = Column(Integer, ForeignKey("seats.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ticket_code = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="valid")  # valid, used, cancelled

    order = relationship("Order", back_populates="tickets")
    seat = relationship("Seat", back_populates="tickets")
    user = relationship("User", back_populates="tickets")


class SupportCase(Base):
    __tablename__ = "support_cases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    type = Column(String, nullable=False)  # complaint, refund_request
    status = Column(String, default="open")  # open, resolved, rejected
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="support_cases")
    order = relationship("Order", back_populates="support_cases")
