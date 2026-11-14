import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import PoojaBookingCreate, PoojaBookingUpdate, PoojaBookingResponse

router = APIRouter()


def _attach_names(booking: models.PoojaBooking) -> models.PoojaBooking:
    booking.deity_name = booking.deity.name if booking.deity else "N/A"
    booking.pooja_name = booking.pooja_service.name if booking.pooja_service else "N/A"
    return booking


@router.get("/", response_model=List[PoojaBookingResponse])
def list_bookings(
    search: Optional[str] = None,
    date: Optional[datetime.date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.PoojaBooking)
    if search:
        like = f"%{search}%"
        query = query.filter(
            models.PoojaBooking.devotee_name.ilike(like)
            | models.PoojaBooking.mobile.ilike(like)
        )
    if date:
        query = query.filter(models.PoojaBooking.pooja_date == date)
    bookings = query.order_by(models.PoojaBooking.id.desc()).offset(skip).limit(limit).all()
    return [_attach_names(b) for b in bookings]


@router.get("/{booking_id}", response_model=PoojaBookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.PoojaBooking).filter(models.PoojaBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return _attach_names(booking)


@router.post("/", response_model=PoojaBookingResponse, status_code=201)
def create_booking(payload: PoojaBookingCreate, db: Session = Depends(get_db)):
    count = db.query(models.PoojaBooking).count()
    booking_id = f"BKG{count + 1:03d}"
    booking = models.PoojaBooking(
        booking_id=booking_id,
        booking_date=datetime.date.today(),
        **payload.model_dump(),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _attach_names(booking)


@router.put("/{booking_id}", response_model=PoojaBookingResponse)
def update_booking(booking_id: int, payload: PoojaBookingUpdate, db: Session = Depends(get_db)):
    booking = db.query(models.PoojaBooking).filter(models.PoojaBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(booking, field, value)
    db.commit()
    db.refresh(booking)
    return _attach_names(booking)


@router.delete("/{booking_id}", response_model=PoojaBookingResponse)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    """Soft delete: set payment_status to Cancelled."""
    booking = db.query(models.PoojaBooking).filter(models.PoojaBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.payment_status = "Cancelled"
    db.commit()
    db.refresh(booking)
    return _attach_names(booking)
