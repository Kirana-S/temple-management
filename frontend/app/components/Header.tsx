"use client";
import React from "react";
import { Landmark, Calendar } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function Header({ title, subtitle, children }: Props) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white border-b border-temple-border px-4 sm:px-8 py-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-maroon-700 uppercase tracking-wider">
            Bhairaveshwara Swami &amp; Vana Durga Parameshwari Temple
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 mt-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {subtitle && <span className="text-sm text-gray-500 font-normal">| {subtitle}</span>}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
          <Calendar size={13} className="text-saffron-600" />
          <span>{today}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {children}
        <div className="flex items-center gap-2 bg-saffron-50 border border-saffron-300 px-3.5 py-2 rounded-lg text-saffron-900 shadow-sm">
          <Landmark size={16} className="text-saffron-700" />
          <span className="text-xs font-bold uppercase tracking-wider">Administrator</span>
        </div>
      </div>
    </header>
  );
}
