import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "Bhairaveshwara Swami & Vana Durga Parameshwari Temple",
  description:
    "Hindu Temple Management System for Bhairaveshwara Swami and Vana Durga Parameshwari Hindu Temple",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-temple-bg text-gray-900 antialiased min-h-screen">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden pt-14 md:pt-0">
              {children}
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
