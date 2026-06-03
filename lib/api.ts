import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api",
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const registerUserApi = async (userData: any) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (email: string, passwordStr: string) => {
  const response = await api.post("/auth/login", {
    email,
    password: passwordStr,
  });
  return response.data;
};

export const createBooking = async (bookingData: any) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");
  return response.data;
};

export const cancelBooking = async (id: number | string) => {
  // Convert ID to number before calling backend
  const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;
  const response = await api.put(`/bookings/${numericId}/cancel`);
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get("/admin/bookings");
  return response.data;
};

export const updateBookingStatus = async (id: number | string, status: string) => {
  const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;
  const response = await api.put(`/admin/bookings/${numericId}/status?status=${status}`);
  return response.data;
};

// Cabs API
export const getCabs = async () => {
  const response = await api.get("/cabs");
  return response.data;
};

export const addCab = async (cabData: any) => {
  const response = await api.post("/admin/cabs", cabData);
  return response.data;
};

export const updateCab = async (id: number | string, cabData: any) => {
  const response = await api.put(`/admin/cabs/${id}`, cabData);
  return response.data;
};

export const deleteCab = async (id: number | string) => {
  const response = await api.delete(`/admin/cabs/${id}`);
  return response.data;
};
