from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import PoojaServiceCreate, PoojaServiceUpdate, PoojaServiceResponse

router = APIRouter()


def _attach_deity_name(ps: models.PoojaService) -> models.PoojaService:
    ps.deity_name = ps.deity.name if ps.deity else None
    return ps


@router.get("/", response_model=List[PoojaServiceResponse])
def list_poojas(
    search: Optional[str] = None,
    deity_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.PoojaService)
    if search:
        query = query.filter(models.PoojaService.name.ilike(f"%{search}%"))
    if deity_id is not None:
        query = query.filter(models.PoojaService.deity_id == deity_id)
    poojas = query.order_by(models.PoojaService.id).all()
    return [_attach_deity_name(p) for p in poojas]


@router.get("/{pooja_id}", response_model=PoojaServiceResponse)
def get_pooja(pooja_id: int, db: Session = Depends(get_db)):
    ps = db.query(models.PoojaService).filter(models.PoojaService.id == pooja_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Pooja service not found")
    return _attach_deity_name(ps)


@router.post("/", response_model=PoojaServiceResponse, status_code=201)
def create_pooja(payload: PoojaServiceCreate, db: Session = Depends(get_db)):
    count = db.query(models.PoojaService).count()
    pooja_id = f"POO{count + 1:03d}"
    ps = models.PoojaService(pooja_id=pooja_id, **payload.model_dump())
    db.add(ps)
    db.commit()
    db.refresh(ps)
    return _attach_deity_name(ps)


@router.put("/{pooja_id}", response_model=PoojaServiceResponse)
def update_pooja(pooja_id: int, payload: PoojaServiceUpdate, db: Session = Depends(get_db)):
    ps = db.query(models.PoojaService).filter(models.PoojaService.id == pooja_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Pooja service not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(ps, field, value)
    db.commit()
    db.refresh(ps)
    return _attach_deity_name(ps)


@router.delete("/{pooja_id}", status_code=204)
def delete_pooja(pooja_id: int, db: Session = Depends(get_db)):
    ps = db.query(models.PoojaService).filter(models.PoojaService.id == pooja_id).first()
    if not ps:
        raise HTTPException(status_code=404, detail="Pooja service not found")
    db.delete(ps)
    db.commit()
