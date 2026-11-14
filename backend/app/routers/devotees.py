import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import DevoteeCreate, DevoteeUpdate, DevoteeResponse

router = APIRouter()


@router.get("/", response_model=List[DevoteeResponse])
def list_devotees(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Devotee)
    if search:
        like = f"%{search}%"
        query = query.filter(
            models.Devotee.full_name.ilike(like)
            | models.Devotee.mobile.ilike(like)
            | models.Devotee.city.ilike(like)
        )
    return query.order_by(models.Devotee.id.desc()).offset(skip).limit(limit).all()


@router.get("/{devotee_id}", response_model=DevoteeResponse)
def get_devotee(devotee_id: int, db: Session = Depends(get_db)):
    devotee = db.query(models.Devotee).filter(models.Devotee.id == devotee_id).first()
    if not devotee:
        raise HTTPException(status_code=404, detail="Devotee not found")
    return devotee


@router.post("/", response_model=DevoteeResponse, status_code=201)
def create_devotee(payload: DevoteeCreate, db: Session = Depends(get_db)):
    count = db.query(models.Devotee).count()
    devotee_id = f"DEV{count + 1:03d}"
    devotee = models.Devotee(
        devotee_id=devotee_id,
        registration_date=datetime.date.today(),
        **payload.model_dump(),
    )
    db.add(devotee)
    db.commit()
    db.refresh(devotee)
    return devotee


@router.put("/{devotee_id}", response_model=DevoteeResponse)
def update_devotee(devotee_id: int, payload: DevoteeUpdate, db: Session = Depends(get_db)):
    devotee = db.query(models.Devotee).filter(models.Devotee.id == devotee_id).first()
    if not devotee:
        raise HTTPException(status_code=404, detail="Devotee not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(devotee, field, value)
    db.commit()
    db.refresh(devotee)
    return devotee


@router.delete("/{devotee_id}", status_code=204)
def delete_devotee(devotee_id: int, db: Session = Depends(get_db)):
    devotee = db.query(models.Devotee).filter(models.Devotee.id == devotee_id).first()
    if not devotee:
        raise HTTPException(status_code=404, detail="Devotee not found")
    db.delete(devotee)
    db.commit()
