import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse

router = APIRouter()


@router.get("/", response_model=List[ExpenseResponse])
def list_expenses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    date: Optional[datetime.date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Expense)
    if search:
        query = query.filter(models.Expense.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(models.Expense.category == category)
    if date:
        query = query.filter(models.Expense.expense_date == date)
    return query.order_by(models.Expense.id.desc()).offset(skip).limit(limit).all()


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    count = db.query(models.Expense).count()
    expense_id = f"EXP{count + 1:03d}"
    data = payload.model_dump()
    if not data.get("expense_date"):
        data["expense_date"] = datetime.date.today()
    expense = models.Expense(expense_id=expense_id, **data)
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(expense_id: int, payload: ExpenseUpdate, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
