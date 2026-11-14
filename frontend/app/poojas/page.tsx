"use client";
import React, { useEffect, useState } from "react";
import {
  Flame,
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import Header from "../components/Header";
import ConfirmDialog from "../components/ConfirmDialog";
import { poojaApi, deityApi } from "../services/api";
import { PoojaService, Deity } from "../types";
import { useToast } from "../components/Toast";

export default function PoojasPage() {
  const { showToast } = useToast();
  const [poojas, setPoojas] = useState<PoojaService[]>([]);
  const [deities, setDeities] = useState<Deity[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDeity, setSelectedDeity] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPooja, setEditingPooja] = useState<PoojaService | null>(null);
  const [form, setForm] = useState({
    name: "",
    deity_id: "",
    description: "",
    amount: "",
    is_available: true,
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<PoojaService | null>(null);

  const fetchDeities = async () => {
    try {
      const res = await deityApi.list();
      setDeities(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPoojas = async () => {
    try {
      setLoading(true);
      const res = await poojaApi.list(search, selectedDeity);
      setPoojas(res.data);
    } catch (err: any) {
      showToast("Error loading pooja services", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeities();
  }, []);

  useEffect(() => {
    fetchPoojas();
  }, [selectedDeity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPoojas();
  };

  const openAddModal = () => {
    setEditingPooja(null);
    setForm({
      name: "",
      deity_id: deities.length > 0 ? String(deities[0].id) : "",
      description: "",
      amount: "",
      is_available: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (p: PoojaService) => {
    setEditingPooja(p);
    setForm({
      name: p.name,
      deity_id: p.deity_id ? String(p.deity_id) : "",
      description: p.description || "",
      amount: String(p.amount),
      is_available: p.is_available,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount) {
      showToast("Name and amount are required", "error");
      return;
    }

    const payload = {
      name: form.name.trim(),
      deity_id: form.deity_id ? Number(form.deity_id) : null,
      description: form.description.trim() || null,
      amount: Number(form.amount),
      is_available: form.is_available,
    };

    try {
      if (editingPooja) {
        await poojaApi.update(editingPooja.id, payload);
        showToast(`Pooja "${payload.name}" updated successfully`);
      } else {
        await poojaApi.create(payload);
        showToast(`Pooja "${payload.name}" created successfully`);
      }
      setModalOpen(false);
      fetchPoojas();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to save pooja service", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await poojaApi.delete(deleteTarget.id);
      showToast(`Pooja "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchPoojas();
    } catch (err: any) {
      showToast("Failed to delete pooja service", "error");
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Pooja &amp; Seva Services"
        subtitle="Configure poojas, abhishekas, sevas and donation amounts"
      >
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} /> Add Pooja Service
        </button>
      </Header>

      <div className="px-8 py-6 space-y-6">
        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-temple-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
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
                  placeholder="Search by pooja name..."
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
              <select
                value={selectedDeity || ""}
                onChange={(e) =>
                  setSelectedDeity(e.target.value ? Number(e.target.value) : undefined)
                }
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
              >
                <option value="">All Deities</option>
                {deities.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-gray-600">
            Total Services: <span className="text-maroon-700 font-bold">{poojas.length}</span>
          </div>
        </div>

        {/* Pooja Table */}
        <div className="bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-50/80 text-gray-700 font-bold border-b border-temple-border uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Pooja ID</th>
                  <th className="py-3.5 px-4">Pooja / Seva Name</th>
                  <th className="py-3.5 px-4">Assigned Deity</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Loading pooja services...
                    </td>
                  </tr>
                ) : poojas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No pooja services found. Click &quot;Add Pooja Service&quot; to configure one.
                    </td>
                  </tr>
                ) : (
                  poojas.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-saffron-800">
                        {p.pooja_id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {p.deity_name ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-saffron-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {p.deity_name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">General / All</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 text-sm">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            p.is_available
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.is_available ? (
                            <>
                              <CheckCircle2 size={11} /> Available
                            </>
                          ) : (
                            <>
                              <XCircle size={11} /> Unavailable
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">
                        {p.description || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-gray-600 hover:text-saffron-700 hover:bg-saffron-50 rounded transition"
                            title="Edit pooja"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-gray-400 hover:text-maroon-700 hover:bg-maroon-50 rounded transition"
                            title="Delete pooja"
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

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-temple-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-saffron-600" />
                <h3 className="text-base font-bold text-gray-900">
                  {editingPooja ? "Edit Pooja Service" : "Add Pooja Service"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pooja Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rudrabhisheka, Archana"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assign Deity
                </label>
                <select
                  value={form.deity_id}
                  onChange={(e) => setForm({ ...form, deity_id: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
                >
                  <option value="">General / All Deities</option>
                  {deities.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Pooja Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="e.g. 501"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Items included, timings, significance..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={form.is_available}
                  onChange={(e) =>
                    setForm({ ...form, is_available: e.target.checked })
                  }
                  className="rounded text-saffron-600 focus:ring-saffron-400 h-4 w-4"
                />
                <label
                  htmlFor="is_available"
                  className="text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Available for devotees to book
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  {editingPooja ? "Save Changes" : "Create Pooja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Pooja Service"
        message={`Are you sure you want to delete "${deleteTarget?.name}" (${deleteTarget?.pooja_id})?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
