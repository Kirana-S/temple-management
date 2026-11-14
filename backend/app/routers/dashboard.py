import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas import DashboardStats, MonthlyChartData

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    today = datetime.date.today()
    first_of_month = today.replace(day=1)

    total_devotees = db.query(func.count(models.Devotee.id)).scalar() or 0

    total_donations = db.query(func.sum(models.Donation.amount)).scalar() or 0.0
    today_donations = (
        db.query(func.sum(models.Donation.amount))
        .filter(models.Donation.donation_date == today)
        .scalar()
        or 0.0
    )

    total_bookings = (
        db.query(func.count(models.PoojaBooking.id))
        .filter(models.PoojaBooking.payment_status != "Cancelled")
        .scalar()
        or 0
    )
    today_bookings = (
        db.query(func.count(models.PoojaBooking.id))
        .filter(
            models.PoojaBooking.pooja_date == today,
            models.PoojaBooking.payment_status != "Cancelled",
        )
        .scalar()
        or 0
    )

    total_expenses = db.query(func.sum(models.Expense.amount)).scalar() or 0.0

    monthly_income = (
        db.query(func.sum(models.Donation.amount))
        .filter(models.Donation.donation_date >= first_of_month)
        .scalar()
        or 0.0
    )
    monthly_expenses = (
        db.query(func.sum(models.Expense.amount))
        .filter(models.Expense.expense_date >= first_of_month)
        .scalar()
        or 0.0
    )

    return DashboardStats(
        total_devotees=total_devotees,
        total_donations=float(total_donations),
        today_donations=float(today_donations),
        total_bookings=total_bookings,
        today_bookings=today_bookings,
        total_expenses=float(total_expenses),
        monthly_income=float(monthly_income),
        monthly_expenses=float(monthly_expenses),
    )


@router.get("/recent")
def get_recent(db: Session = Depends(get_db)) -> Dict[str, Any]:
    recent_donations = (
        db.query(models.Donation)
        .order_by(models.Donation.id.desc())
        .limit(5)
        .all()
    )
    recent_bookings = (
        db.query(models.PoojaBooking)
        .order_by(models.PoojaBooking.id.desc())
        .limit(5)
        .all()
    )
    recent_expenses = (
        db.query(models.Expense)
        .order_by(models.Expense.id.desc())
        .limit(5)
        .all()
    )

    return {
        "donations": [
            {
                "donation_id": d.donation_id,
                "donor_name": d.donor_name,
                "amount": d.amount,
                "donation_date": str(d.donation_date),
                "category": d.category,
            }
            for d in recent_donations
        ],
        "bookings": [
            {
                "booking_id": b.booking_id,
                "devotee_name": b.devotee_name,
                "amount": b.amount,
                "pooja_date": str(b.pooja_date),
                "payment_status": b.payment_status,
            }
            for b in recent_bookings
        ],
        "expenses": [
            {
                "expense_id": e.expense_id,
                "title": e.title,
                "amount": e.amount,
                "expense_date": str(e.expense_date),
                "category": e.category,
            }
            for e in recent_expenses
        ],
    }


@router.get("/chart", response_model=List[MonthlyChartData])
def get_chart(db: Session = Depends(get_db)):
    today = datetime.date.today()
    result: List[MonthlyChartData] = []

    for i in range(5, -1, -1):
        # Compute the first day of the month i months ago
        month_offset = today.month - i
        year_offset = today.year
        while month_offset <= 0:
            month_offset += 12
            year_offset -= 1
        first_day = datetime.date(year_offset, month_offset, 1)
        # Last day of that month
        if month_offset == 12:
            last_day = datetime.date(year_offset + 1, 1, 1) - datetime.timedelta(days=1)
        else:
            last_day = datetime.date(year_offset, month_offset + 1, 1) - datetime.timedelta(days=1)

        income = (
            db.query(func.sum(models.Donation.amount))
            .filter(
                models.Donation.donation_date >= first_day,
                models.Donation.donation_date <= last_day,
            )
            .scalar()
            or 0.0
        )
        expenses = (
            db.query(func.sum(models.Expense.amount))
            .filter(
                models.Expense.expense_date >= first_day,
                models.Expense.expense_date <= last_day,
            )
            .scalar()
            or 0.0
        )

        month_label = first_day.strftime("%b %Y")
        result.append(
            MonthlyChartData(month=month_label, income=float(income), expenses=float(expenses))
        )

    return result
