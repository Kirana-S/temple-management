import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ─── Devotee ────────────────────────────────────────────────────────────────

class DevoteeBase(BaseModel):
    full_name: str
    mobile: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class DevoteeCreate(DevoteeBase):
    pass

class DevoteeUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class DevoteeResponse(DevoteeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    devotee_id: str
    registration_date: Optional[datetime.date] = None


# ─── Deity ───────────────────────────────────────────────────────────────────

class DeityBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class DeityCreate(DeityBase):
    pass

class DeityUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class DeityResponse(DeityBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime.datetime] = None


# ─── PoojaService ────────────────────────────────────────────────────────────

class PoojaServiceBase(BaseModel):
    name: str
    deity_id: Optional[int] = None
    description: Optional[str] = None
    amount: float
    is_available: bool = True

class PoojaServiceCreate(PoojaServiceBase):
    pass

class PoojaServiceUpdate(BaseModel):
    name: Optional[str] = None
    deity_id: Optional[int] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    is_available: Optional[bool] = None

class PoojaServiceResponse(PoojaServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pooja_id: str
    deity_name: Optional[str] = None
    created_at: Optional[datetime.datetime] = None


# ─── PoojaBooking ────────────────────────────────────────────────────────────

class PoojaBookingBase(BaseModel):
    devotee_id: Optional[int] = None
    devotee_name: str
    mobile: str
    deity_id: Optional[int] = None
    pooja_service_id: Optional[int] = None
    pooja_date: datetime.date
    amount: float
    payment_method: str = "Cash"
    payment_status: str = "Pending"
    notes: Optional[str] = None

class PoojaBookingCreate(PoojaBookingBase):
    pass

class PoojaBookingUpdate(BaseModel):
    devotee_id: Optional[int] = None
    devotee_name: Optional[str] = None
    mobile: Optional[str] = None
    deity_id: Optional[int] = None
    pooja_service_id: Optional[int] = None
    pooja_date: Optional[datetime.date] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None

class PoojaBookingResponse(PoojaBookingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: str
    booking_date: Optional[datetime.date] = None
    deity_name: Optional[str] = None
    pooja_name: Optional[str] = None
    created_at: Optional[datetime.datetime] = None


# ─── Donation ────────────────────────────────────────────────────────────────

class DonationBase(BaseModel):
    donor_name: str
    mobile: str
    category: str
    amount: float
    donation_date: Optional[datetime.date] = None
    payment_method: str = "Cash"
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None

class DonationCreate(DonationBase):
    pass

class DonationUpdate(BaseModel):
    donor_name: Optional[str] = None
    mobile: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    donation_date: Optional[datetime.date] = None
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None

class DonationResponse(DonationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    donation_id: str
    receipt_number: str
    created_at: Optional[datetime.datetime] = None


# ─── Expense ─────────────────────────────────────────────────────────────────

class ExpenseBase(BaseModel):
    title: str
    category: str
    amount: float
    expense_date: Optional[datetime.date] = None
    payment_method: str = "Cash"
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    expense_date: Optional[datetime.date] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expense_id: str
    created_at: Optional[datetime.datetime] = None


# ─── Dashboard ───────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_devotees: int
    total_donations: float
    today_donations: float
    total_bookings: int
    today_bookings: int
    total_expenses: float
    monthly_income: float
    monthly_expenses: float

class MonthlyChartData(BaseModel):
    month: str
    income: float
    expenses: float

class RecentItem(BaseModel):
    id: str
    name: str
    amount: float
    date: str
    type: str
