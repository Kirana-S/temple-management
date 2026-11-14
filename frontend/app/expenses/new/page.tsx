"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ReceiptText,
  Tag,
  IndianRupee,
  Calendar,
  CreditCard,
  FileText,
  Edit3,
} from "lucide-react";
import Header from "../../components/Header";
import { expenseApi } from "../../services/api";
import { useToast } from "../../components/Toast";

const EXPENSE_CATEGORIES = [
  "Temple Maintenance",
  "Electricity",
  "Water",
  "Pooja Materials",
  "Festival Expenses",
  "Annadana Expenses",
  "Staff Expenses",
  "Repairs",
  "Other",
];

export default function NewExpensePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    category: "Temple Maintenance",
    amount: "",
    expense_date: todayStr,
    payment_method: "Cash",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) {
      showToast("Title and amount are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        category: form.category,
        amount: Number(form.amount),
        expense_date: form.expense_date,
        payment_method: form.payment_method,
        description: form.description.trim() || null,
      };

      const res = await expenseApi.create(payload);
      showToast(`Expense recorded! ID: ${res.data.expense_id}`);
      router.push("/expenses");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to record expense", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Record Temple Expense"
        subtitle="Log operational, maintenance, materials, or ceremonial expenses"
      >
        <Link
          href="/expenses"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 shadow-sm transition"
        >
          <ArrowLeft size={14} /> Back to Expenses
        </Link>
      </Header>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-temple-border p-6 sm:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-gray-100">
            <div className="p-2.5 rounded-lg bg-rose-100 text-rose-800">
              <ReceiptText size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Expense Record</h2>
              <p className="text-xs text-gray-500">
                An Expense ID (e.g. EXP001) will be generated automatically.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Expense Title / Purpose <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Edit3 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Electricity Bill, Camphor & Incense Purchase"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expense Category <span className="text-rose-600">*</span>
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
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
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
                    min="1"
                    placeholder="e.g. 2500"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500 font-bold text-maroon-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expense Date <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    required
                    value={form.expense_date}
                    onChange={(e) =>
                      setForm({ ...form, expense_date: e.target.value })
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
                Description / Vendor / Receipt Number
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <textarea
                  rows={3}
                  placeholder="e.g. Paid to BESCOM bill counter, receipt no. 48291..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Link
                href="/expenses"
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                {submitting ? "Saving Expense..." : "Record Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
