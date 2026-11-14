"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ReceiptText,
  Plus,
  Search,
  Pencil,
  Trash2,
  Filter,
  Tag,
  Calendar,
  IndianRupee,
  X,
} from "lucide-react";
import Header from "../components/Header";
import ConfirmDialog from "../components/ConfirmDialog";
import { expenseApi } from "../services/api";
import { Expense } from "../types";
import { useToast } from "../components/Toast";

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

export default function ExpensesPage() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "Temple Maintenance",
    amount: "",
    expense_date: "",
    payment_method: "Cash",
    description: "",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await expenseApi.list(search, category, date);
      setExpenses(res.data);
    } catch (err: any) {
      showToast("Error loading temple expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [category, date]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpenses();
  };

  const openEditModal = (e: Expense) => {
    setEditingExpense(e);
    setEditForm({
      title: e.title,
      category: e.category,
      amount: String(e.amount),
      expense_date: e.expense_date,
      payment_method: e.payment_method,
      description: e.description || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    try {
      await expenseApi.update(editingExpense.id, {
        title: editForm.title.trim(),
        category: editForm.category,
        amount: Number(editForm.amount),
        expense_date: editForm.expense_date,
        payment_method: editForm.payment_method,
        description: editForm.description.trim() || null,
      });
      showToast(`Expense ${editingExpense.expense_id} updated`);
      setEditingExpense(null);
      fetchExpenses();
    } catch (err: any) {
      showToast("Failed to update expense", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await expenseApi.delete(deleteTarget.id);
      showToast(`Expense ${deleteTarget.expense_id} deleted`);
      setDeleteTarget(null);
      fetchExpenses();
    } catch (err: any) {
      showToast("Failed to delete expense", "error");
    }
  };

  const totalFilteredAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="pb-12">
      <Header
        title="Temple Expenses"
        subtitle="Track maintenance, utilities, materials and staff expenditures"
      >
        <Link
          href="/expenses/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} /> Add Expense
        </Link>
      </Header>

      <div className="px-8 py-6 space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-temple-border flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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
                  placeholder="Search expense title or note..."
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
              <Tag size={15} className="text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
              />
              {date && (
                <button
                  onClick={() => setDate("")}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Clear Date
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
            <div>
              Count: <span className="text-gray-900 font-bold">{expenses.length}</span>
            </div>
            <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-200">
              Total Expenses: <span className="font-extrabold">₹{totalFilteredAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 text-gray-700 font-bold border-b border-temple-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Expense ID</th>
                  <th className="py-3.5 px-4">Expense Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Expense Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Loading expenses...
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No expenses found. Click &quot;Add Expense&quot; to log a record.
                    </td>
                  </tr>
                ) : (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-saffron-800">
                        {e.expense_id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {e.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-rose-950 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-maroon-700 text-sm">
                        ₹{e.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {e.expense_date}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {e.payment_method}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                        {e.description || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(e)}
                            className="p-1.5 text-gray-600 hover:text-saffron-700 hover:bg-saffron-50 rounded transition"
                            title="Edit expense"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(e)}
                            className="p-1.5 text-gray-400 hover:text-maroon-700 hover:bg-maroon-50 rounded transition"
                            title="Delete expense"
                          >
                            <Trash2 size={15} />
                          </button>
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

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-temple-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} className="text-maroon-700" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Expense ({editingExpense.expense_id})
                </h3>
              </div>
              <button
                onClick={() => setEditingExpense(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm({ ...editForm, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.expense_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, expense_date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description / Receipt Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Expense Record"
        message={`Are you sure you want to delete expense "${deleteTarget?.title}" (${deleteTarget?.expense_id}) for ₹${deleteTarget?.amount}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
