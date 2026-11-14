import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base


class Devotee(Base):
    __tablename__ = "devotees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    devotee_id = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    registration_date = Column(Date, default=datetime.date.today)

    bookings = relationship("PoojaBooking", back_populates="devotee")


class Deity(Base):
    __tablename__ = "deities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

    pooja_services = relationship("PoojaService", back_populates="deity")
    bookings = relationship("PoojaBooking", back_populates="deity")


class PoojaService(Base):
    __tablename__ = "pooja_services"

    id = Column(Integer, primary_key=True, autoincrement=True)
    pooja_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    deity_id = Column(Integer, ForeignKey("deities.id"), nullable=True)
    description = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

    deity = relationship("Deity", back_populates="pooja_services")
    bookings = relationship("PoojaBooking", back_populates="pooja_service")


class PoojaBooking(Base):
    __tablename__ = "pooja_bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(String, unique=True, nullable=False)
    devotee_id = Column(Integer, ForeignKey("devotees.id"), nullable=True)
    devotee_name = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    deity_id = Column(Integer, ForeignKey("deities.id"), nullable=True)
    pooja_service_id = Column(Integer, ForeignKey("pooja_services.id"), nullable=True)
    booking_date = Column(Date, default=datetime.date.today)
    pooja_date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="Cash")
    payment_status = Column(String, default="Pending")
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)

    devotee = relationship("Devotee", back_populates="bookings")
    deity = relationship("Deity", back_populates="bookings")
    pooja_service = relationship("PoojaService", back_populates="bookings")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    donation_id = Column(String, unique=True, nullable=False)
    receipt_number = Column(String, unique=True, nullable=False)
    donor_name = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    donation_date = Column(Date, default=datetime.date.today)
    payment_method = Column(String, default="Cash")
    transaction_reference = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    expense_id = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    expense_date = Column(Date, default=datetime.date.today)
    payment_method = Column(String, default="Cash")
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
