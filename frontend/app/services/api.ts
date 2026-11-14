import axios from "axios";

const API_BASE = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Devotees
export const devoteeApi = {
  list: (search?: string) => api.get("/devotees/", { params: { search, limit: 100 } }),
  get: (id: number) => api.get(`/devotees/${id}`),
  create: (data: any) => api.post("/devotees/", data),
  update: (id: number, data: any) => api.put(`/devotees/${id}`, data),
  delete: (id: number) => api.delete(`/devotees/${id}`),
};

// Deities
export const deityApi = {
  list: () => api.get("/deities/"),
  get: (id: number) => api.get(`/deities/${id}`),
  create: (data: any) => api.post("/deities/", data),
  update: (id: number, data: any) => api.put(`/deities/${id}`, data),
  delete: (id: number) => api.delete(`/deities/${id}`),
};

// Poojas
export const poojaApi = {
  list: (search?: string, deity_id?: number) =>
    api.get("/poojas/", { params: { search, deity_id: deity_id || undefined, limit: 100 } }),
  get: (id: number) => api.get(`/poojas/${id}`),
  create: (data: any) => api.post("/poojas/", data),
  update: (id: number, data: any) => api.put(`/poojas/${id}`, data),
  delete: (id: number) => api.delete(`/poojas/${id}`),
};

// Bookings
export const bookingApi = {
  list: (search?: string, date?: string) =>
    api.get("/bookings/", { params: { search: search || undefined, date: date || undefined, limit: 100 } }),
  get: (id: number) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post("/bookings/", data),
  update: (id: number, data: any) => api.put(`/bookings/${id}`, data),
  cancel: (id: number) => api.delete(`/bookings/${id}`),
};

// Donations
export const donationApi = {
  list: (search?: string, category?: string, date?: string) =>
    api.get("/donations/", {
      params: { search: search || undefined, category: category || undefined, date: date || undefined, limit: 100 },
    }),
  get: (id: number) => api.get(`/donations/${id}`),
  create: (data: any) => api.post("/donations/", data),
  update: (id: number, data: any) => api.put(`/donations/${id}`, data),
  delete: (id: number) => api.delete(`/donations/${id}`),
};

// Expenses
export const expenseApi = {
  list: (search?: string, category?: string, date?: string) =>
    api.get("/expenses/", {
      params: { search: search || undefined, category: category || undefined, date: date || undefined, limit: 100 },
    }),
  get: (id: number) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post("/expenses/", data),
  update: (id: number, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
  recent: () => api.get("/dashboard/recent"),
  chart: () => api.get("/dashboard/chart"),
};

// Reports
export const reportsApi = {
  donations: (params: any) => api.get("/reports/donations", { params }),
  bookings: (params: any) => api.get("/reports/bookings", { params }),
  expenses: (params: any) => api.get("/reports/expenses", { params }),
  summary: (params: any) => api.get("/reports/summary", { params }),
};
