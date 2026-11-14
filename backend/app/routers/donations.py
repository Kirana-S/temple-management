import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import DonationCreate, DonationUpdate, DonationResponse

router = APIRouter()


@router.get("/", response_model=List[DonationResponse])
def list_donations(
    search: Optional[str] = None,
    category: Optional[str] = None,
    date: Optional[datetime.date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Donation)
    if search:
        like = f"%{search}%"
        query = query.filter(
            models.Donation.donor_name.ilike(like)
            | models.Donation.mobile.ilike(like)
        )
    if category:
        query = query.filter(models.Donation.category == category)
    if date:
        query = query.filter(models.Donation.donation_date == date)
    return query.order_by(models.Donation.id.desc()).offset(skip).limit(limit).all()


@router.get("/{donation_id}", response_model=DonationResponse)
def get_donation(donation_id: int, db: Session = Depends(get_db)):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation


@router.post("/", response_model=DonationResponse, status_code=201)
def create_donation(payload: DonationCreate, db: Session = Depends(get_db)):
    count = db.query(models.Donation).count()
    donation_id = f"DON{count + 1:03d}"
    year = datetime.date.today().year
    receipt_number = f"RCP{year}{count + 1:04d}"
    data = payload.model_dump()
    if not data.get("donation_date"):
        data["donation_date"] = datetime.date.today()
    donation = models.Donation(
        donation_id=donation_id,
        receipt_number=receipt_number,
        **data,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


@router.put("/{donation_id}", response_model=DonationResponse)
def update_donation(donation_id: int, payload: DonationUpdate, db: Session = Depends(get_db)):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(donation, field, value)
    db.commit()
    db.refresh(donation)
    return donation


@router.delete("/{donation_id}", status_code=204)
def delete_donation(donation_id: int, db: Session = Depends(get_db)):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    db.delete(donation)
    db.commit()
