"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  HeartHandshake,
  CalendarCheck2,
  Calendar,
  ReceiptText,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
  Flame,
  ArrowRight,
} from "lucide-react";
import Header from "../components/Header";
import StatCard from "../components/StatCard";
import { dashboardApi } from "../services/api";
import { DashboardStats, MonthlyChartData } from "../types";
import { useToast } from "../components/Toast";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<{
    donations: any[];
    bookings: any[];
    expenses: any[];
  }>({ donations: [], bookings: [], expenses: [] });
  const [chartData, setChartData] = useState<MonthlyChartData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes, chartRes] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.recent(),
        dashboardApi.chart(),
      ]);
      setStats(statsRes.data);
      setRecent(recentRes.data);
      setChartData(chartRes.data);
    } catch (err: any) {
      console.error("Dashboard load error:", err);
      showToast("Unable to connect to backend server. Make sure FastAPI is running on port 8000.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0";
    return `₹${Number(val).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  // Find maximum amount across income and expense for chart scaling
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.income, d.expenses)),
    1000
  );

  return (
    <div className="pb-12">
      <Header
        title="Temple Dashboard"
        subtitle="Live activity summary & financial metrics"
      >
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </Header>

      <div className="px-4 sm:px-8 py-6 space-y-6">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-900 mr-2">
            Quick Actions:
          </span>
          <Link
            href="/bookings/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus size={14} /> New Booking
          </Link>
          <Link
            href="/donations/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-maroon-700 hover:bg-maroon-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus size={14} /> Record Donation
          </Link>
          <Link
            href="/expenses/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus size={14} /> Record Expense
          </Link>
          <Link
            href="/devotees/new"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus size={14} /> Register Devotee
          </Link>
        </div>

        {/* 8 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Devotees"
            value={stats?.total_devotees ?? 0}
            icon={Users}
            color="bg-amber-600"
            subtitle="Registered devotees"
          />
          <StatCard
            title="Total Donations"
            value={formatCurrency(stats?.total_donations)}
            icon={HeartHandshake}
            color="bg-emerald-600"
            subtitle="All-time received"
          />
          <StatCard
            title="Today's Donations"
            value={formatCurrency(stats?.today_donations)}
            icon={Calendar}
            color="bg-teal-600"
            subtitle="Recorded today"
          />
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings ?? 0}
            icon={CalendarCheck2}
            color="bg-saffron-600"
            subtitle="Active pooja services"
          />
          <StatCard
            title="Today's Bookings"
            value={stats?.today_bookings ?? 0}
            icon={Flame}
            color="bg-purple-600"
            subtitle="Scheduled for today"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats?.total_expenses)}
            icon={ReceiptText}
            color="bg-maroon-700"
            subtitle="All-time temple expenses"
          />
          <StatCard
            title="Monthly Income"
            value={formatCurrency(stats?.monthly_income)}
            icon={TrendingUp}
            color="bg-green-700"
            subtitle="Current calendar month"
          />
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(stats?.monthly_expenses)}
            icon={TrendingDown}
            color="bg-rose-700"
            subtitle="Current calendar month"
          />
        </div>

        {/* Chart: Monthly Income vs Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-temple-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-gray-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Monthly Financial Overview (Income vs Expenses)
              </h3>
              <p className="text-xs text-gray-500">
                Showing actual recorded donation income and expenses over the last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-saffron-500 inline-block"></span>
                <span className="text-gray-700">Donation Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-maroon-700 inline-block"></span>
                <span className="text-gray-700">Expenses</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-2">
            <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-56 pt-6 border-b border-gray-200">
              {chartData.map((item, idx) => {
                const incomePercent = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
                const expensePercent = maxVal > 0 ? (item.expenses / maxVal) * 100 : 0;

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-3 h-full pb-1">
                      {/* Income Bar */}
                      <div
                        className="w-1/2 max-w-[28px] bg-saffron-500 hover:bg-saffron-600 rounded-t transition-all duration-300 relative"
                        style={{ height: `${Math.max(incomePercent, 2)}%` }}
                        title={`Income: ₹${item.income}`}
                      >
                        {item.income > 0 && (
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10 transition">
                            ₹{item.income.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Expense Bar */}
                      <div
                        className="w-1/2 max-w-[28px] bg-maroon-700 hover:bg-maroon-800 rounded-t transition-all duration-300 relative"
                        style={{ height: `${Math.max(expensePercent, 2)}%` }}
                        title={`Expenses: ₹${item.expenses}`}
                      >
                        {item.expenses > 0 && (
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10 transition">
                            ₹{item.expenses.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Month Label */}
                    <div className="text-[11px] font-semibold text-gray-600 mt-2 text-center truncate w-full">
                      {item.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3 Recent Columns: Donations, Bookings, Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <HeartHandshake size={18} className="text-saffron-600" />
                <h3 className="font-bold text-gray-900 text-sm">Recent Donations</h3>
              </div>
              <Link
                href="/donations"
                className="text-xs text-saffron-700 hover:text-saffron-900 font-semibold flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 flex-1 mt-2">
              {recent.donations.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No donations recorded yet
                </div>
              ) : (
                recent.donations.map((d: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{d.donor_name}</p>
                      <p className="text-[11px] text-gray-500">
                        {d.category} • {d.donation_date}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 shrink-0">
                      ₹{Number(d.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarCheck2 size={18} className="text-purple-600" />
                <h3 className="font-bold text-gray-900 text-sm">Recent Pooja Bookings</h3>
              </div>
              <Link
                href="/bookings"
                className="text-xs text-saffron-700 hover:text-saffron-900 font-semibold flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 flex-1 mt-2">
              {recent.bookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No pooja bookings recorded yet
                </div>
              ) : (
                recent.bookings.map((b: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{b.devotee_name}</p>
                      <p className="text-[11px] text-gray-500">
                        Pooja: {b.pooja_date}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-gray-900">
                        ₹{Number(b.amount).toLocaleString("en-IN")}
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          b.payment_status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.payment_status === "Cancelled"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.payment_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} className="text-maroon-700" />
                <h3 className="font-bold text-gray-900 text-sm">Recent Expenses</h3>
              </div>
              <Link
                href="/expenses"
                className="text-xs text-saffron-700 hover:text-saffron-900 font-semibold flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-100 flex-1 mt-2">
              {recent.expenses.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No expenses recorded yet
                </div>
              ) : (
                recent.expenses.map((e: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-800 truncate">{e.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {e.category} • {e.expense_date}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-maroon-700 shrink-0">
                      ₹{Number(e.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
