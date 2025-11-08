import { request } from "./http";

export const register = (body: { name: string; email: string; password: string }) =>
  request<{
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    token?: string;
  }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) });

export const login = (body: { email: string; password: string }) =>
  request<{
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    token?: string;
  }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) });

export const me = () =>
  request<{
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
  }>("/api/auth/me");

export const logout = () => request<{}>("/api/auth/logout", { method: "POST" });
