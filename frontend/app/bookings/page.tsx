"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Search,
  Printer,
  Ban,
  Pencil,
  Phone,
  Flame,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Filter,
} from "lucide-react";
import Header from "../components/Header";
import ConfirmDialog from "../components/ConfirmDialog";
import { bookingApi } from "../services/api";
import { PoojaBooking } from "../types";
import { useToast } from "../components/Toast";
import { printReceipt } from "../components/Receipt";

export default function BookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<PoojaBooking[]>([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingBooking, setEditingBooking] = useState<PoojaBooking | null>(null);
  const [editForm, setEditForm] = useState({
    pooja_date: "",
    amount: "",
    payment_method: "Cash",
    payment_status: "Paid",
    notes: "",
  });

  // Cancel State
  const [cancelTarget, setCancelTarget] = useState<PoojaBooking | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.list(search, filterDate);
      setBookings(res.data);
    } catch (err: any) {
      showToast("Error loading pooja bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handlePrint = (b: PoojaBooking) => {
    printReceipt({
      type: "booking",
      receipt_number: b.booking_id,
      date: b.booking_date,
      name: b.devotee_name,
      mobile: b.mobile,
      detailsTitle: "Pooja & Deity Service",
      detailsValue: `${b.pooja_name || "Pooja Service"} (${b.deity_name || "General"}) - Scheduled on ${b.pooja_date}`,
      amount: b.amount,
      payment_method: `${b.payment_method} (${b.payment_status})`,
      notes: b.notes,
    });
  };

  const openEditModal = (b: PoojaBooking) => {
    setEditingBooking(b);
    setEditForm({
      pooja_date: b.pooja_date,
      amount: String(b.amount),
      payment_method: b.payment_method,
      payment_status: b.payment_status,
      notes: b.notes || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    try {
      await bookingApi.update(editingBooking.id, {
        pooja_date: editForm.pooja_date,
        amount: Number(editForm.amount),
        payment_method: editForm.payment_method,
        payment_status: editForm.payment_status,
        notes: editForm.notes || null,
      });
      showToast(`Booking ${editingBooking.booking_id} updated`);
      setEditingBooking(null);
      fetchBookings();
    } catch (err: any) {
      showToast("Failed to update booking", "error");
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;
    try {
      await bookingApi.cancel(cancelTarget.id);
      showToast(`Booking ${cancelTarget.booking_id} has been cancelled`);
      setCancelTarget(null);
      fetchBookings();
    } catch (err: any) {
      showToast("Failed to cancel booking", "error");
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Pooja Bookings"
        subtitle="Manage pooja and abhisheka schedules, payments and devotee receipts"
      >
        <Link
          href="/bookings/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} /> New Pooja Booking
        </Link>
      </Header>

      <div className="px-8 py-6 space-y-6">
        {/* Search & Date Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-temple-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search devotee name or mobile..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <Filter size={15} className="text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-600">
            Total Bookings: <span className="text-maroon-700 font-bold">{bookings.length}</span>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 text-gray-700 font-bold border-b border-temple-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Devotee Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Deity</th>
                  <th className="py-3.5 px-4">Pooja Service</th>
                  <th className="py-3.5 px-4">Pooja Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      Loading bookings...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      No bookings found. Click &quot;New Pooja Booking&quot; to schedule one.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-saffron-800">
                        {b.booking_id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {b.devotee_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {b.mobile}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-800">
                        {b.deity_name ? (
                          <span className="font-semibold text-saffron-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {b.deity_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">General</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        <span className="flex items-center gap-1">
                          <Flame size={13} className="text-saffron-600 shrink-0" />
                          {b.pooja_name || "Pooja"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {b.pooja_date}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm">
                        ₹{b.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            b.payment_status === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.payment_status === "Cancelled"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.payment_status === "Paid" && <CheckCircle2 size={11} />}
                          {b.payment_status === "Pending" && <Clock size={11} />}
                          {b.payment_status === "Cancelled" && <XCircle size={11} />}
                          {b.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrint(b)}
                            className="p-1.5 text-saffron-700 hover:text-saffron-900 hover:bg-saffron-100 rounded transition"
                            title="Print receipt"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(b)}
                            className="p-1.5 text-gray-600 hover:text-saffron-700 hover:bg-saffron-50 rounded transition"
                            title="Edit booking"
                          >
                            <Pencil size={15} />
                          </button>
                          {b.payment_status !== "Cancelled" && (
                            <button
                              onClick={() => setCancelTarget(b)}
                              className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                              title="Cancel booking"
                            >
                              <Ban size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Booking Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-temple-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-saffron-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Booking ({editingBooking.booking_id})
                </h3>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pooja Date *
                </label>
                <input
                  type="date"
                  required
                  value={editForm.pooja_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, pooja_date: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editForm.payment_method}
                    onChange={(e) =>
                      setEditForm({ ...editForm, payment_method: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={editForm.payment_status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, payment_status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        title="Cancel Pooja Booking"
        message={`Are you sure you want to cancel booking ${cancelTarget?.booking_id} for ${cancelTarget?.devotee_name}? The booking will be marked as Cancelled.`}
        confirmLabel="Cancel Booking"
        confirmClass="bg-rose-700 hover:bg-rose-800"
        onConfirm={handleCancelBooking}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
