"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Flame,
  CalendarDays,
  HeartHandshake,
  ReceiptText,
  BarChart3,
  Landmark,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devotees", label: "Devotees", icon: Users },
  { href: "/deities", label: "Deities", icon: Sparkles },
  { href: "/poojas", label: "Pooja Services", icon: Flame },
  { href: "/bookings", label: "Pooja Bookings", icon: CalendarDays },
  { href: "/donations", label: "Donations", icon: HeartHandshake },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-temple-border flex flex-col shadow-sm select-none">
      {/* Temple Branding Header */}
      <div className="temple-gradient p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🕉️</span>
          <span className="text-xs uppercase tracking-widest text-golden-200 font-semibold">
            Hindu Temple
          </span>
        </div>
        <h1 className="font-extrabold text-base leading-tight tracking-wide text-white drop-shadow-sm">
          Bhairaveshwara Swami
        </h1>
        <p className="text-xs text-saffron-100 font-medium mt-0.5">
          &amp; Vana Durga Parameshwari
        </p>
        <div className="mt-3 pt-2 border-t border-white/20 flex items-center gap-1.5 text-[11px] text-golden-100 font-medium">
          <Landmark size={13} />
          <span>Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? "active" : "text-gray-700 hover:text-saffron-800"}`}
            >
              <Icon size={18} className={active ? "text-white" : "text-saffron-600"} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-temple-border bg-amber-50/50">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Temple Admin Active</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Version 1.0 • Phase 1</p>
      </div>
    </aside>
  );
}
