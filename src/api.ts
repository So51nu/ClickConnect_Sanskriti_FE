import axios from "axios";
import { API_BASE } from "./env";

export const api = axios.create({
  baseURL: API_BASE,
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export type EnquiryPayload = { name: string; mobile: string; email: string };

export async function postEnquiry(payload: EnquiryPayload) {
  return api.post("/enquiries/", payload);
}

export async function adminLogin(username_or_email: string, password: string) {
  return api.post("/auth/admin/login/", { username_or_email, password });
}

export async function getEnquiries(page = 1) {
  return api.get(`/admin/enquiries/?page=${page}`);
}

export async function exportExcel() {
  return api.get("/admin/enquiries/export/excel/", { responseType: "blob" });
}

export async function exportPdf() {
  return api.get("/admin/enquiries/export/pdf/", { responseType: "blob" });
}
