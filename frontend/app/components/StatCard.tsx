import React from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon: Icon, color, subtitle }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5 flex items-center gap-4 transition hover:shadow-md">
      <div className={`${color} p-3.5 rounded-xl text-white shadow-sm shrink-0`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
