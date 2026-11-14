import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import DonationResponse, PoojaBookingResponse, ExpenseResponse

router = APIRouter()


@router.get("/donations", response_model=List[DonationResponse])
def report_donations(
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Donation)
    if start_date:
        query = query.filter(models.Donation.donation_date >= start_date)
    if end_date:
        query = query.filter(models.Donation.donation_date <= end_date)
    if category:
        query = query.filter(models.Donation.category == category)
    return query.order_by(models.Donation.donation_date.desc()).all()


@router.get("/bookings", response_model=List[PoojaBookingResponse])
def report_bookings(
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.PoojaBooking)
    if start_date:
        query = query.filter(models.PoojaBooking.pooja_date >= start_date)
    if end_date:
        query = query.filter(models.PoojaBooking.pooja_date <= end_date)
    bookings = query.order_by(models.PoojaBooking.pooja_date.desc()).all()
    for b in bookings:
        b.deity_name = b.deity.name if b.deity else "N/A"
        b.pooja_name = b.pooja_service.name if b.pooja_service else "N/A"
    return bookings


@router.get("/expenses", response_model=List[ExpenseResponse])
def report_expenses(
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Expense)
    if start_date:
        query = query.filter(models.Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(models.Expense.expense_date <= end_date)
    if category:
        query = query.filter(models.Expense.category == category)
    return query.order_by(models.Expense.expense_date.desc()).all()


@router.get("/summary")
def report_summary(
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    don_query = db.query(func.sum(models.Donation.amount))
    exp_query = db.query(func.sum(models.Expense.amount))
    bkg_query = db.query(func.count(models.PoojaBooking.id)).filter(
        models.PoojaBooking.payment_status != "Cancelled"
    )

    if start_date:
        don_query = don_query.filter(models.Donation.donation_date >= start_date)
        exp_query = exp_query.filter(models.Expense.expense_date >= start_date)
        bkg_query = bkg_query.filter(models.PoojaBooking.pooja_date >= start_date)
    if end_date:
        don_query = don_query.filter(models.Donation.donation_date <= end_date)
        exp_query = exp_query.filter(models.Expense.expense_date <= end_date)
        bkg_query = bkg_query.filter(models.PoojaBooking.pooja_date <= end_date)

    total_donations = float(don_query.scalar() or 0.0)
    total_expenses = float(exp_query.scalar() or 0.0)
    total_bookings = int(bkg_query.scalar() or 0)
    balance = total_donations - total_expenses

    return {
        "total_donations": total_donations,
        "total_expenses": total_expenses,
        "total_bookings": total_bookings,
        "balance": balance,
    }
