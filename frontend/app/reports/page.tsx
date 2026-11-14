"use client";
import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Filter,
  Printer,
  HeartHandshake,
  CalendarDays,
  ReceiptText,
  TrendingUp,
  TrendingDown,
  Scale,
  RefreshCw,
} from "lucide-react";
import Header from "../components/Header";
import { reportsApi } from "../services/api";
import { useToast } from "../components/Toast";

export default function ReportsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"summary" | "donations" | "bookings" | "expenses">("summary");

  // Date filters
  const todayStr = new Date().toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);

  // Data states
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    total_donations: number;
    total_expenses: number;
    total_bookings: number;
    balance: number;
  }>({ total_donations: 0, total_expenses: 0, total_bookings: 0, balance: 0 });

  const [donationsList, setDonationsList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [sumRes, donRes, bkgRes, expRes] = await Promise.all([
        reportsApi.summary(params),
        reportsApi.donations(params),
        reportsApi.bookings(params),
        reportsApi.expenses(params),
      ]);

      setSummaryData(sumRes.data);
      setDonationsList(donRes.data);
      setBookingsList(bkgRes.data);
      setExpensesList(expRes.data);
    } catch (err: any) {
      showToast("Error loading financial reports", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const setPreset = (preset: "today" | "this_month" | "all") => {
    if (preset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "this_month") {
      setStartDate(firstOfMonth);
      setEndDate(todayStr);
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  return (
    <div className="pb-12">
      {/* Header hidden on print */}
      <div className="print:hidden">
        <Header
          title="Temple Accounts &amp; Reports"
          subtitle="Financial summaries, donations, seva bookings and audit statements"
        >
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
          >
            <Printer size={15} /> Print Report
          </button>
        </Header>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-6">
        {/* Printable Temple Header (Only visible on print) */}
        <div className="hidden print:block text-center border-b-2 border-maroon-700 pb-4 mb-6">
          <div className="text-2xl font-bold text-maroon-700">
            Bhairaveshwara Swami &amp; Vana Durga Parameshwari Hindu Temple
          </div>
          <div className="text-sm text-gray-600">
            Official Statement of Accounts &amp; Activities
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Period: {startDate || "Beginning"} to {endDate || "Today"} | Generated on:{" "}
            <span suppressHydrationWarning>{new Date().toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        {/* Filter Toolbar (Hidden on print) */}
        <div className="print:hidden bg-white p-5 rounded-xl shadow-sm border border-temple-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white"
              />
            </div>
            <button
              onClick={fetchReports}
              className="flex items-center gap-1 px-4 py-2 bg-saffron-500 hover:bg-saffron-600 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Apply Filter
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Presets:</span>
            <button
              onClick={() => {
                setPreset("today");
                fetchReports();
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-saffron-900 border border-amber-200 rounded text-xs font-semibold transition"
            >
              Today
            </button>
            <button
              onClick={() => {
                setPreset("this_month");
                fetchReports();
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-saffron-900 border border-amber-200 rounded text-xs font-semibold transition"
            >
              This Month
            </button>
            <button
              onClick={() => {
                setPreset("all");
                fetchReports();
              }}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-saffron-900 border border-amber-200 rounded text-xs font-semibold transition"
            >
              All Time
            </button>
          </div>
        </div>

        {/* 4 Summary Cards (Visible on screen and print) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Donations
              </span>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">
              ₹{Number(summaryData.total_donations).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {donationsList.length} donation receipt(s)
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Expenses
              </span>
              <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
                <TrendingDown size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-maroon-700 mt-2">
              ₹{Number(summaryData.total_expenses).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {expensesList.length} expense record(s)
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Pooja Bookings
              </span>
              <div className="p-2 bg-purple-100 text-purple-800 rounded-lg">
                <CalendarDays size={16} />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-700 mt-2">
              {summaryData.total_bookings}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Scheduled ceremonies in period
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-temple-border p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Net Remaining Balance
              </span>
              <div className="p-2 bg-amber-100 text-saffron-800 rounded-lg">
                <Scale size={16} />
              </div>
            </div>
            <div
              className={`text-2xl font-black mt-2 ${
                summaryData.balance >= 0 ? "text-emerald-800" : "text-rose-700"
              }`}
            >
              ₹{Number(summaryData.balance).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-gray-400 mt-1">Income minus expenditure</div>
          </div>
        </div>

        {/* Navigation Tabs (Hidden on print) */}
        <div className="print:hidden flex border-b border-gray-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "summary"
                ? "border-saffron-500 text-saffron-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart3 size={16} /> Summary Statement
          </button>
          <button
            onClick={() => setActiveTab("donations")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "donations"
                ? "border-saffron-500 text-saffron-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <HeartHandshake size={16} /> Donations Register ({donationsList.length})
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "bookings"
                ? "border-saffron-500 text-saffron-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <CalendarDays size={16} /> Pooja Bookings ({bookingsList.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === "expenses"
                ? "border-saffron-500 text-saffron-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <ReceiptText size={16} /> Expenses Register ({expensesList.length})
          </button>
        </div>

        {/* Tab 1: Summary Statement */}
        {(activeTab === "summary" || typeof window !== "undefined") && (
          <div className={`${activeTab !== "summary" ? "hidden print:block" : ""} space-y-6`}>
            <div className="bg-white rounded-xl shadow-sm border border-temple-border p-6">
              <h3 className="font-bold text-gray-900 text-sm mb-4">
                Temple Financial Ledger Summary
              </h3>
              <table className="w-full text-xs text-left">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-semibold text-gray-700">
                      Total Donations Received
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm">
                      + ₹{Number(summaryData.total_donations).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-semibold text-gray-700">
                      Total Temple Expenditures
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-maroon-700 text-sm">
                      - ₹{Number(summaryData.total_expenses).toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className="bg-amber-50/70 border-t-2 border-saffron-300">
                    <td className="py-3.5 px-4 font-bold text-saffron-950 text-sm">
                      Net Remaining Operating Balance
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-saffron-950 text-base">
                      ₹{Number(summaryData.balance).toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Donations List */}
        {(activeTab === "donations" || typeof window !== "undefined") && (
          <div className={`${activeTab !== "donations" ? "hidden print:block" : ""} bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden`}>
            <div className="p-4 bg-amber-50/50 border-b border-gray-100 font-bold text-xs text-gray-800">
              Donations Itemized Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Receipt</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Donor Name</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donationsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No donation records for this period
                      </td>
                    </tr>
                  ) : (
                    donationsList.map((d: any) => (
                      <tr key={d.id}>
                        <td className="py-2.5 px-4 font-mono font-bold text-saffron-800">
                          {d.receipt_number}
                        </td>
                        <td className="py-2.5 px-4">{d.donation_date}</td>
                        <td className="py-2.5 px-4 font-bold text-gray-900">{d.donor_name}</td>
                        <td className="py-2.5 px-4">{d.mobile}</td>
                        <td className="py-2.5 px-4">{d.category}</td>
                        <td className="py-2.5 px-4">{d.payment_method}</td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-emerald-700">
                          ₹{Number(d.amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bookings List */}
        {(activeTab === "bookings" || typeof window !== "undefined") && (
          <div className={`${activeTab !== "bookings" ? "hidden print:block" : ""} bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden`}>
            <div className="p-4 bg-amber-50/50 border-b border-gray-100 font-bold text-xs text-gray-800">
              Pooja Bookings Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Pooja Date</th>
                    <th className="py-3 px-4">Devotee Name</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Deity</th>
                    <th className="py-3 px-4">Pooja Service</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookingsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No pooja bookings for this period
                      </td>
                    </tr>
                  ) : (
                    bookingsList.map((b: any) => (
                      <tr key={b.id}>
                        <td className="py-2.5 px-4 font-mono font-bold text-saffron-800">
                          {b.booking_id}
                        </td>
                        <td className="py-2.5 px-4 font-bold">{b.pooja_date}</td>
                        <td className="py-2.5 px-4 font-bold text-gray-900">{b.devotee_name}</td>
                        <td className="py-2.5 px-4">{b.mobile}</td>
                        <td className="py-2.5 px-4">{b.deity_name || "General"}</td>
                        <td className="py-2.5 px-4">{b.pooja_name || "Pooja"}</td>
                        <td className="py-2.5 px-4 font-semibold">{b.payment_status}</td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-purple-700">
                          ₹{Number(b.amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Expenses List */}
        {(activeTab === "expenses" || typeof window !== "undefined") && (
          <div className={`${activeTab !== "expenses" ? "hidden print:block" : ""} bg-white rounded-xl shadow-sm border border-temple-border overflow-hidden`}>
            <div className="p-4 bg-amber-50/50 border-b border-gray-100 font-bold text-xs text-gray-800">
              Expenses Ledger Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Expense ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expensesList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No expense records for this period
                      </td>
                    </tr>
                  ) : (
                    expensesList.map((e: any) => (
                      <tr key={e.id}>
                        <td className="py-2.5 px-4 font-mono font-bold text-saffron-800">
                          {e.expense_id}
                        </td>
                        <td className="py-2.5 px-4">{e.expense_date}</td>
                        <td className="py-2.5 px-4 font-bold text-gray-900">{e.title}</td>
                        <td className="py-2.5 px-4">{e.category}</td>
                        <td className="py-2.5 px-4">{e.payment_method}</td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-maroon-700">
                          ₹{Number(e.amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Signature Box (For printouts) */}
        <div className="hidden print:flex justify-between pt-16 text-xs text-gray-700">
          <div className="border-t border-gray-600 pt-2 w-48 text-center font-bold">
            Temple Trustee / Secretary
          </div>
          <div className="border-t border-gray-600 pt-2 w-48 text-center font-bold">
            Treasurer / Auditor
          </div>
        </div>
      </div>
    </div>
  );
}
