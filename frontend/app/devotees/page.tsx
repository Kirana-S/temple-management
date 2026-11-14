"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import Header from "../components/Header";
import ConfirmDialog from "../components/ConfirmDialog";
import { devoteeApi } from "../services/api";
import { Devotee } from "../types";
import { useToast } from "../components/Toast";

export default function DevoteesPage() {
  const { showToast } = useToast();
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingDevotee, setEditingDevotee] = useState<Devotee | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Devotee | null>(null);

  const fetchDevotees = async (query = "") => {
    try {
      setLoading(true);
      const res = await devoteeApi.list(query);
      setDevotees(res.data);
    } catch (err: any) {
      showToast("Error loading devotees list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevotees(search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDevotees(search);
  };

  const openEditModal = (devotee: Devotee) => {
    setEditingDevotee(devotee);
    setEditForm({
      full_name: devotee.full_name,
      mobile: devotee.mobile,
      email: devotee.email || "",
      address: devotee.address || "",
      city: devotee.city || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevotee) return;
    try {
      await devoteeApi.update(editingDevotee.id, editForm);
      showToast("Devotee updated successfully!");
      setEditingDevotee(null);
      fetchDevotees(search);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to update devotee", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await devoteeApi.delete(deleteTarget.id);
      showToast(`Devotee ${deleteTarget.full_name} deleted`);
      setDeleteTarget(null);
      fetchDevotees(search);
    } catch (err: any) {
      showToast("Failed to delete devotee", "error");
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Devotee Management"
        subtitle="Manage temple devotees database & contacts"
      >
        <Link
          href="/devotees/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} /> Add Devotee
        </Link>
      </Header>

      <div className="px-8 py-6 space-y-6">
        {/* Search & Stats Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-temple-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, mobile, city..."
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

          <div className="text-xs font-semibold text-gray-600">
            Total Devotees: <span className="text-maroon-700 font-bold">{devotees.length}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 text-gray-700 font-bold border-b border-temple-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Devotee ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Mobile</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Loading devotee records...
                    </td>
                  </tr>
                ) : devotees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No devotees found. Click &quot;Add Devotee&quot; to register someone.
                    </td>
                  </tr>
                ) : (
                  devotees.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-saffron-800">
                        {d.devotee_id}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {d.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {d.mobile}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {d.email ? (
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <Mail size={12} className="text-gray-400" />
                            {d.email}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {d.city ? (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" />
                            {d.city}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {d.registration_date}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(d)}
                            className="p-1.5 text-gray-600 hover:text-saffron-700 hover:bg-saffron-50 rounded transition"
                            title="Edit devotee"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(d)}
                            className="p-1.5 text-gray-400 hover:text-maroon-700 hover:bg-maroon-50 rounded transition"
                            title="Delete devotee"
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

      {/* Edit Devotee Modal */}
      {editingDevotee && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-temple-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-saffron-600" />
                <h3 className="text-base font-bold text-gray-900">
                  Edit Devotee ({editingDevotee.devotee_id})
                </h3>
              </div>
              <button
                onClick={() => setEditingDevotee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) =>
                      setEditForm({ ...editForm, address: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingDevotee(null)}
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
        title="Delete Devotee"
        message={`Are you sure you want to delete devotee "${deleteTarget?.full_name}" (${deleteTarget?.devotee_id})? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
