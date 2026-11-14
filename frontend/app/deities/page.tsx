"use client";
import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Info,
} from "lucide-react";
import Header from "../components/Header";
import ConfirmDialog from "../components/ConfirmDialog";
import { deityApi } from "../services/api";
import { Deity } from "../types";
import { useToast } from "../components/Toast";

export default function DeitiesPage() {
  const { showToast } = useToast();
  const [deities, setDeities] = useState<Deity[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeity, setEditingDeity] = useState<Deity | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Deity | null>(null);

  const fetchDeities = async () => {
    try {
      setLoading(true);
      const res = await deityApi.list();
      setDeities(res.data);
    } catch (err: any) {
      showToast("Error loading deities", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeities();
  }, []);

  const openAddModal = () => {
    setEditingDeity(null);
    setFormData({ name: "", description: "", is_active: true });
    setModalOpen(true);
  };

  const openEditModal = (deity: Deity) => {
    setEditingDeity(deity);
    setFormData({
      name: deity.name,
      description: deity.description || "",
      is_active: deity.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Deity name is required", "error");
      return;
    }

    try {
      if (editingDeity) {
        await deityApi.update(editingDeity.id, formData);
        showToast(`Deity "${formData.name}" updated successfully`);
      } else {
        await deityApi.create(formData);
        showToast(`Deity "${formData.name}" created successfully`);
      }
      setModalOpen(false);
      fetchDeities();
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to save deity", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deityApi.delete(deleteTarget.id);
      showToast(`Deity "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchDeities();
    } catch (err: any) {
      showToast("Failed to delete deity", "error");
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Deity Management"
        subtitle="Manage presiding deities, sanctums & worship descriptions"
      >
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} /> Add Deity
        </button>
      </Header>

      <div className="px-8 py-6 space-y-6">
        {/* Banner about default deities */}
        <div className="bg-amber-50 border border-saffron-200 p-4 rounded-xl flex items-start gap-3">
          <Info size={18} className="text-saffron-700 shrink-0 mt-0.5" />
          <div className="text-xs text-saffron-950">
            <span className="font-bold">Presiding Deities: </span>
            Lord Bhairaveshwara Swami and Goddess Vana Durga Parameshwari are the primary sanctum deities of the temple. You can activate, deactivate, or add auxiliary shrines as needed.
          </div>
        </div>

        {/* Deities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-16 text-center text-xs text-gray-400">
              Loading deities...
            </div>
          ) : deities.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-gray-400">
              No deities found. Click &quot;Add Deity&quot; to add one.
            </div>
          ) : (
            deities.map((deity) => (
              <div
                key={deity.id}
                className="bg-white rounded-xl shadow-sm border border-temple-border p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-saffron-100 text-saffron-800">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm">{deity.name}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        deity.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {deity.is_active ? (
                        <>
                          <CheckCircle2 size={11} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={11} /> Inactive
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {deity.description || (
                      <span className="text-gray-400 italic">No description provided</span>
                    )}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(deity)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-saffron-50 hover:text-saffron-800 rounded-lg transition"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(deity)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-maroon-50 hover:text-maroon-700 rounded-lg transition"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-temple-border">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-saffron-600" />
                <h3 className="text-base font-bold text-gray-900">
                  {editingDeity ? "Edit Deity" : "Add New Deity"}
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
                  Deity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhairaveshwara Swami"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, significance, sanctum information..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded text-saffron-600 focus:ring-saffron-400 h-4 w-4"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Active for pooja bookings &amp; offerings
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
                  {editingDeity ? "Save Changes" : "Create Deity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Deity"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Any poojas associated with this deity will remain.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
