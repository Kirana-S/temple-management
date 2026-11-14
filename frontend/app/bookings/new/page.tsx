"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Phone,
  Sparkles,
  Flame,
  Calendar,
  IndianRupee,
  FileText,
} from "lucide-react";
import Header from "../../components/Header";
import { bookingApi, devoteeApi, deityApi, poojaApi } from "../../services/api";
import { Devotee, Deity, PoojaService } from "../../types";
import { useToast } from "../../components/Toast";
import { printReceipt } from "../../components/Receipt";

export default function NewBookingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [deities, setDeities] = useState<Deity[]>([]);
  const [allPoojas, setAllPoojas] = useState<PoojaService[]>([]);
  const [filteredPoojas, setFilteredPoojas] = useState<PoojaService[]>([]);

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    devotee_id: "",
    devotee_name: "",
    mobile: "",
    deity_id: "",
    pooja_service_id: "",
    pooja_date: todayStr,
    amount: "",
    payment_method: "Cash",
    payment_status: "Paid",
    notes: "",
  });

  useEffect(() => {
    Promise.all([devoteeApi.list(), deityApi.list(), poojaApi.list()])
      .then(([devRes, deityRes, poojaRes]) => {
        setDevotees(devRes.data);
        setDeities(deityRes.data);
        setAllPoojas(poojaRes.data);
        setFilteredPoojas(poojaRes.data);
      })
      .catch((err) => {
        console.error("Failed to load reference lists", err);
      });
  }, []);

  // When a devotee is picked from dropdown, fill in name and mobile
  const handleDevoteeSelect = (idStr: string) => {
    if (!idStr) {
      setForm((prev) => ({ ...prev, devotee_id: "" }));
      return;
    }
    const selected = devotees.find((d) => String(d.id) === idStr);
    if (selected) {
      setForm((prev) => ({
        ...prev,
        devotee_id: idStr,
        devotee_name: selected.full_name,
        mobile: selected.mobile,
      }));
    }
  };

  // Filter poojas when deity changes
  const handleDeityChange = (deityIdStr: string) => {
    setForm((prev) => ({
      ...prev,
      deity_id: deityIdStr,
      pooja_service_id: "",
      amount: "",
    }));

    if (!deityIdStr) {
      setFilteredPoojas(allPoojas);
    } else {
      const numId = Number(deityIdStr);
      const filtered = allPoojas.filter(
        (p) => !p.deity_id || p.deity_id === numId
      );
      setFilteredPoojas(filtered);
    }
  };

  // When pooja service changes, auto-fill amount
  const handlePoojaChange = (poojaIdStr: string) => {
    const selected = allPoojas.find((p) => String(p.id) === poojaIdStr);
    setForm((prev) => ({
      ...prev,
      pooja_service_id: poojaIdStr,
      amount: selected ? String(selected.amount) : prev.amount,
      deity_id: selected?.deity_id ? String(selected.deity_id) : prev.deity_id,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.devotee_name.trim() || !form.mobile.trim() || !form.amount) {
      showToast("Devotee name, mobile, and amount are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        devotee_id: form.devotee_id ? Number(form.devotee_id) : null,
        devotee_name: form.devotee_name.trim(),
        mobile: form.mobile.trim(),
        deity_id: form.deity_id ? Number(form.deity_id) : null,
        pooja_service_id: form.pooja_service_id
          ? Number(form.pooja_service_id)
          : null,
        pooja_date: form.pooja_date,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        payment_status: form.payment_status,
        notes: form.notes.trim() || null,
      };

      const res = await bookingApi.create(payload);
      showToast(
        `Pooja booking created successfully! (ID: ${res.data.booking_id})`
      );

      // Offer printing
      const askPrint = confirm(
        `Booking ${res.data.booking_id} created!\nWould you like to print the receipt now?`
      );
      if (askPrint) {
        printReceipt({
          type: "booking",
          receipt_number: res.data.booking_id,
          date: res.data.booking_date,
          name: res.data.devotee_name,
          mobile: res.data.mobile,
          detailsTitle: "Pooja & Deity Service",
          detailsValue: `${res.data.pooja_name || "Pooja Service"} (${res.data.deity_name || "General"}) - Scheduled on ${res.data.pooja_date}`,
          amount: res.data.amount,
          payment_method: `${res.data.payment_method} (${res.data.payment_status})`,
          notes: res.data.notes,
        });
      }

      router.push("/bookings");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to create booking", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="New Pooja Booking"
        subtitle="Schedule a divine pooja service or abhisheka for a devotee"
      >
        <Link
          href="/bookings"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 shadow-sm transition"
        >
          <ArrowLeft size={14} /> Back to Bookings
        </Link>
      </Header>

      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-temple-border p-6 sm:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-gray-100">
            <div className="p-2.5 rounded-lg bg-saffron-100 text-saffron-700">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Pooja Booking Details
              </h2>
              <p className="text-xs text-gray-500">
                Booking ID (e.g., BKG001) will be generated automatically.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Devotee Selection */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron-900">
                  Devotee Selection
                </span>
                <span className="text-[11px] text-gray-500">
                  Select existing or type below for walk-in
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Choose from Registered Devotees
                </label>
                <select
                  value={form.devotee_id}
                  onChange={(e) => handleDevoteeSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                >
                  <option value="">-- Walk-in Devotee (Type details below) --</option>
                  {devotees.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.mobile}) - {d.devotee_id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Devotee Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Devotee name"
                      value={form.devotee_name}
                      onChange={(e) =>
                        setForm({ ...form, devotee_name: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={form.mobile}
                      onChange={(e) =>
                        setForm({ ...form, mobile: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Service & Deity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Select Deity
                </label>
                <div className="relative">
                  <Sparkles size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={form.deity_id}
                    onChange={(e) => handleDeityChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                  >
                    <option value="">All / General Deity</option>
                    {deities.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pooja / Seva <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Flame size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    required
                    value={form.pooja_service_id}
                    onChange={(e) => handlePoojaChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                  >
                    <option value="">-- Choose Pooja Service --</option>
                    {filteredPoojas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.amount}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date and Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pooja Date <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={form.pooja_date}
                    onChange={(e) =>
                      setForm({ ...form, pooja_date: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Amount (₹) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Pooja fee"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({ ...form, payment_method: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Payment Status
                </label>
                <select
                  value={form.payment_status}
                  onChange={(e) =>
                    setForm({ ...form, payment_status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white font-semibold text-emerald-800"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Special Notes / Sankalpa / Gotra
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <textarea
                  rows={2}
                  placeholder="e.g. Kashyapa gotra, for birthday prayers..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Link
                href="/bookings"
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                {submitting ? "Confirming Booking..." : "Confirm & Save Booking"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
