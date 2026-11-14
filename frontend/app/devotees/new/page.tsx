"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Users, Phone, Mail, MapPin, Building2 } from "lucide-react";
import Header from "../../components/Header";
import { devoteeApi } from "../../services/api";
import { useToast } from "../../components/Toast";

export default function NewDevoteePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.mobile.trim()) {
      showToast("Full name and mobile number are required", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await devoteeApi.create({
        full_name: form.full_name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
      });
      showToast(`Devotee ${res.data.full_name} registered successfully! (ID: ${res.data.devotee_id})`);
      router.push("/devotees");
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to register devotee", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-12">
      <Header
        title="Add New Devotee"
        subtitle="Register a new devotee in the temple database"
      >
        <Link
          href="/devotees"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 shadow-sm transition"
        >
          <ArrowLeft size={14} /> Back to Devotees
        </Link>
      </Header>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-temple-border p-6 sm:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-gray-100">
            <div className="p-2.5 rounded-lg bg-saffron-100 text-saffron-700">
              <UserPlus size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Devotee Information</h2>
              <p className="text-xs text-gray-500">
                A unique Devotee ID (e.g., DEV001) will be generated automatically.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
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
                  placeholder="e.g. 9876543210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="e.g. ramesh@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. #12, 4th Cross, Malleshwaram"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <Link
                href="/devotees"
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                {submitting ? "Saving Devotee..." : "Register Devotee"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
