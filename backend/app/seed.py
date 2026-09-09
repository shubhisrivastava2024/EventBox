from datetime import datetime, timedelta
from app.database import engine, Base, SessionLocal
from app.models import User, Venue, Event, Seat, Order, Ticket, SupportCase
from app.auth import hash_password
from app.routers.orders import generate_ticket_code

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).first():
            print("Database already seeded.")
            return

        print("Seeding initial data...")

        # 1. Seed Users (All 5 roles)
        users_data = [
            {"name": "Admin User", "email": "admin@eventbox.com", "password": "password123", "role": "admin"},
            {"name": "Event Organizer", "email": "organizer@eventbox.com", "password": "password123", "role": "organizer"},
            {"name": "John Customer", "email": "customer@eventbox.com", "password": "password123", "role": "customer"},
            {"name": "Entry Officer Alex", "email": "entry@eventbox.com", "password": "password123", "role": "entry_manager"},
            {"name": "Support Rep Sarah", "email": "support@eventbox.com", "password": "password123", "role": "support"},
        ]

        users = []
        for u in users_data:
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                role=u["role"]
            )
            db.add(user)
            users.append(user)

        db.commit()

        # 2. Seed Venues
        v1 = Venue(name="Metropolis Convention Center", city="San Francisco", address="500 Howard St, SF, CA", total_capacity=20)
        v2 = Venue(name="Cyber Arena & Tech Hub", city="Austin", address="100 Innovation Way, Austin, TX", total_capacity=30)
        db.add_all([v1, v2])
        db.commit()

        # 3. Seed Events
        now = datetime.utcnow()
        e1 = Event(
            venue_id=v1.id,
            name="3-Day National AI & Web3 Hackathon 2026",
            category="Tech",
            event_date=now + timedelta(days=5),
            ticket_price=49.99,
            max_tickets_per_user=3,
            status="upcoming"
        )
        e2 = Event(
            venue_id=v2.id,
            name="Global CyberSecurity Keynote & Expo",
            category="Conference",
            event_date=now + timedelta(days=12),
            ticket_price=99.00,
            max_tickets_per_user=5,
            status="upcoming"
        )
        e3 = Event(
            venue_id=v1.id,
            name="Full-Stack Dev Workshop & Bootcamp",
            category="Workshop",
            event_date=now + timedelta(days=20),
            ticket_price=29.00,
            max_tickets_per_user=2,
            status="upcoming"
        )
        db.add_all([e1, e2, e3])
        db.commit()

        # 4. Generate Seats for Events
        for evt, cap in [(e1, 20), (e2, 30), (e3, 20)]:
            seats = []
            for i in range(1, cap + 1):
                row = chr(65 + (i - 1) // 10)  # A, B, C...
                num = ((i - 1) % 10) + 1
                seat = Seat(event_id=evt.id, seat_number=f"{row}-{num}", status="available")
                seats.append(seat)
            db.add_all(seats)
        db.commit()

        # 5. Pre-book sample tickets for Customer to test scanner & refund dashboard right away
        cust = db.query(User).filter(User.email == "customer@eventbox.com").first()
        s1 = db.query(Seat).filter(Seat.event_id == e1.id, Seat.seat_number == "A-1").first()
        s2 = db.query(Seat).filter(Seat.event_id == e1.id, Seat.seat_number == "A-2").first()

        if s1 and s2 and cust:
            s1.status = "booked"
            s2.status = "booked"
            
            order = Order(
                user_id=cust.id,
                total_amount=e1.ticket_price * 2,
                payment_mode="credit_card",
                order_status="confirmed",
                booking_time=now - timedelta(hours=2)
            )
            db.add(order)
            db.commit()

            t1 = Ticket(order_id=order.id, seat_id=s1.id, user_id=cust.id, ticket_code="TCK-DEMO-001", status="valid")
            t2 = Ticket(order_id=order.id, seat_id=s2.id, user_id=cust.id, ticket_code="TCK-DEMO-002", status="valid")
            db.add_all([t1, t2])
            db.commit()

            # Create a sample refund request support case
            case = SupportCase(
                user_id=cust.id,
                order_id=order.id,
                type="refund_request",
                status="open",
                resolution_notes="Customer requested refund due to scheduling conflict."
            )
            db.add(case)
            db.commit()

        print("Database seeded successfully!")

    except Exception as ex:
        print(f"Error seeding database: {ex}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
