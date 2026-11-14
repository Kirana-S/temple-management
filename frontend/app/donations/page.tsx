"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Plus,
  Search,
  Printer,
  Pencil,
  Trash2,
  Filter,
  Phone,
  Tag,
  Calendar,
  X,
} from "lucide-react";
import Header from "../components/Header";
import ConfirmDialog from "../components/ConfirmDialog";
import { donationApi } from "../services/api";
import { Donation } from "../types";
import { useToast } from "../components/Toast";
import { printReceipt } from "../components/Receipt";

const DONATION_CATEGORIES = [
  "General Donation",
  "Annadana Donation",
  "Temple Development",
  "Festival Donation",
  "Building Fund",
  "Other Donation",
];

export default function DonationsPage() {
  const { showToast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit State
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editForm, setEditForm] = useState({
    donor_name: "",
    mobile: "",
    category: "General Donation",
    amount: "",
    donation_date: "",
    payment_method: "Cash",
    transaction_reference: "",
    notes: "",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Donation | null>(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donationApi.list(search, category, date);
      setDonations(res.data);
    } catch (err: any) {
      showToast("Error loading donations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [category, date]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonations();
  };

  const handlePrint = (d: Donation) => {
    printReceipt({
      type: "donation",
      receipt_number: d.receipt_number || d.donation_id,
      date: d.donation_date,
      name: d.donor_name,
      mobile: d.mobile,
      detailsTitle: "Donation Category",
      detailsValue: d.category + (d.transaction_reference ? ` (Ref: ${d.transaction_reference})` : ""),
      amount: d.amount,
      payment_method: d.payment_method,
      notes: d.notes,
    });
  };

  const openEditModal = (d: Donation) => {
    setEditingDonation(d);
    setEditForm({
      donor_name: d.donor_name,
      mobile: d.mobile,
      category: d.category,
      amount: String(d.amount),
      donation_date: d.donation_date,
      payment_method: d.payment_method,
      transaction_reference: d.transaction_reference || "",
      notes: d.notes || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDonation) return;
    try {
      await donationApi.update(editingDonation.id, {
        donor_name: editForm.donor_name.trim(),
        mobile: editForm.mobile.trim(),
        category: editForm.category,
        amount: Number(editForm.amount),
        donation_date: editForm.donation_date,
        payment_method: editForm.payment_method,
        transaction_reference: editForm.transaction_reference.trim() || null,
        notes: editForm.notes.trim() || null,
      });
      showToast(`Donation ${editingDonation.receipt_number} updated`);
      setEditingDonation(null);
      fetchDonations();
    } catch (err: any) {
      showToast("Failed to update donation", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await donationApi.delete(deleteTarget.id);
      showToast(`Donation ${deleteTarget.receipt_number} deleted`);
      setDeleteTarget(null);
      fetchDonations();
    } catch (err: any) {
      showToast("Failed to delete donation", "error");
    }
  };

  const totalFilteredAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <div className="pb-12">
      <Header
        title="Donations &amp; Contributions"
        subtitle="Record, search and generate official temple donation receipts"
      >
        <Link
          href="/donations/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} /> Add Donation
        </Link>
      </Header>

      <div className="px-4 sm:px-8 py-6 space-y-6">
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
                  placeholder="Search donor name or mobile..."
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
                {DONATION_CATEGORIES.map((c) => (
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
              Count: <span className="text-gray-900 font-bold">{donations.length}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200">
              Total: <span className="font-extrabold">₹{totalFilteredAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Donations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 text-gray-700 font-bold border-b border-temple-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-4">Donor Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Donation Date</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Loading donations...
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No donations found. Click &quot;Add Donation&quot; to record one.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-saffron-800">
                        {d.receipt_number}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {d.donor_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {d.mobile}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-saffron-950 bg-saffron-50 border border-saffron-200 px-2.5 py-0.5 rounded-full text-[11px]">
                          {d.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm">
                        ₹{d.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {d.donation_date}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                          {d.payment_method}
                        </span>
                        {d.transaction_reference && (
                          <div className="text-[10px] text-gray-400 truncate max-w-[120px]">
                            Ref: {d.transaction_reference}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handlePrint(d)}
                            className="p-1.5 text-saffron-700 hover:text-saffron-900 hover:bg-saffron-100 rounded transition"
                            title="Print receipt"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => openEditModal(d)}
                            className="p-1.5 text-gray-600 hover:text-saffron-700 hover:bg-saffron-50 rounded transition"
                            title="Edit donation"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(d)}
                            className="p-1.5 text-gray-400 hover:text-maroon-700 hover:bg-maroon-50 rounded transition"
                            title="Delete donation"
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

      {/* Edit Donation Modal */}
      {editingDonation && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-temple-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <HeartHandshake size={18} className="text-saffron-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Donation ({editingDonation.receipt_number})
                </h3>
              </div>
              <button
                onClick={() => setEditingDonation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Donor Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.donor_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, donor_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.mobile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, mobile: e.target.value })
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
                    {DONATION_CATEGORIES.map((c) => (
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
                    Donation Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.donation_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, donation_date: e.target.value })
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
                  Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="UPI ID, UTR, Cheque No"
                  value={editForm.transaction_reference}
                  onChange={(e) =>
                    setEditForm({ ...editForm, transaction_reference: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingDonation(null)}
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
        title="Delete Donation Record"
        message={`Are you sure you want to delete donation ${deleteTarget?.receipt_number} from ${deleteTarget?.donor_name} for ₹${deleteTarget?.amount}?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
