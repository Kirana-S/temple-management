from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import DeityCreate, DeityUpdate, DeityResponse

router = APIRouter()


@router.get("/", response_model=List[DeityResponse])
def list_deities(db: Session = Depends(get_db)):
    return db.query(models.Deity).order_by(models.Deity.id).all()


@router.get("/{deity_id}", response_model=DeityResponse)
def get_deity(deity_id: int, db: Session = Depends(get_db)):
    deity = db.query(models.Deity).filter(models.Deity.id == deity_id).first()
    if not deity:
        raise HTTPException(status_code=404, detail="Deity not found")
    return deity


@router.post("/", response_model=DeityResponse, status_code=201)
def create_deity(payload: DeityCreate, db: Session = Depends(get_db)):
    deity = models.Deity(**payload.model_dump())
    db.add(deity)
    db.commit()
    db.refresh(deity)
    return deity


@router.put("/{deity_id}", response_model=DeityResponse)
def update_deity(deity_id: int, payload: DeityUpdate, db: Session = Depends(get_db)):
    deity = db.query(models.Deity).filter(models.Deity.id == deity_id).first()
    if not deity:
        raise HTTPException(status_code=404, detail="Deity not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(deity, field, value)
    db.commit()
    db.refresh(deity)
    return deity


@router.delete("/{deity_id}", status_code=204)
def delete_deity(deity_id: int, db: Session = Depends(get_db)):
    deity = db.query(models.Deity).filter(models.Deity.id == deity_id).first()
    if not deity:
        raise HTTPException(status_code=404, detail="Deity not found")
    db.delete(deity)
    db.commit()
