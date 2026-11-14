"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  HeartHandshake,
  Users,
  Phone,
  Tag,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import Header from "../../components/Header";
import { donationApi } from "../../services/api";
import { useToast } from "../../components/Toast";
import { printReceipt } from "../../components/Receipt";

const DONATION_CATEGORIES = [
  "General Donation",
  "Annadana Donation",
  "Temple Development",
  "Festival Donation",
  "Building Fund",
  "Other Donation",
];

export default function NewDonationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    donor_name: "",
    mobile: "",
    category: "General Donation",
    amount: "",
    donation_date: todayStr,
    payment_method: "Cash",
    transaction_reference: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.donor_name.trim() || !form.mobile.trim() || !form.amount) {
      showToast("Donor name, mobile, and amount are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        donor_name: form.donor_name.trim(),
        mobile: form.mobile.trim(),
        category: form.category,
        amount: Number(form.amount),
        donation_date: form.donation_date,
        payment_method: form.payment_method,
        transaction_reference: form.transaction_reference.trim() || null,
        notes: form.notes.trim() || null,
      };

      const res = await donationApi.create(payload);
      showToast(`Donation recorded! Receipt: ${res.data.receipt_number}`);

      const askPrint = confirm(
        `Donation ${res.data.receipt_number} recorded!\nWould you like to print the official receipt now?`
      );
      if (askPrint) {
        printReceipt({
          type: "donation",
          receipt_number: res.data.receipt_number,
          date: res.data.donation_date,
          name: res.data.donor_name,
          mobile: res.data.mobile,
          detailsTitle: "Donation Category",
          detailsValue: res.data.category + (res.data.transaction_reference ? ` (Ref: ${res.data.transaction_reference})` : ""),
          amount: res.data.amount,
          payment_method: res.data.payment_method,
          notes: res.data.notes,
        });
      }

      router.push("/donations");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record donation", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Record New Donation"
        subtitle="Accept devotee contributions and issue printable receipt"
      >
        <Link
          href="/donations"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 shadow-sm transition"
        >
          <ArrowLeft size={14} /> Back to Donations
        </Link>
      </Header>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-temple-border p-6 sm:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-gray-100">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Donation Details</h2>
              <p className="text-xs text-gray-500">
                A formal Receipt Number (e.g. RCP20260001) will be auto-generated.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Donor Full Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Kulkarni"
                    value={form.donor_name}
                    onChange={(e) =>
                      setForm({ ...form, donor_name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm({ ...form, mobile: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Donation Category <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                  >
                    {DONATION_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Donation Amount (₹) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1000"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 font-bold text-emerald-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Donation Date <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={form.donation_date}
                    onChange={(e) =>
                      setForm({ ...form, donation_date: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <select
                    value={form.payment_method}
                    onChange={(e) =>
                      setForm({ ...form, payment_method: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Transaction Reference
              </label>
              <input
                type="text"
                placeholder="UPI Reference, Bank Transfer UTR, or Cheque number"
                value={form.transaction_reference}
                onChange={(e) =>
                  setForm({ ...form, transaction_reference: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Notes / Purpose
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <textarea
                  rows={2}
                  placeholder="e.g. Special anniversary contribution, Annadana sponsorship..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Link
                href="/donations"
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                {submitting ? "Saving Donation..." : "Save Donation & Generate Receipt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
