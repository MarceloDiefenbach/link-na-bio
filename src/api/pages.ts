import { request } from "./http";

export interface ProfilePage {
  id: number;
  slug: string;
  title?: string | null;
  description?: string | null;
  instagram_url?: string | null;
  updated_at?: string;
}

type SavePayload = {
  id?: number;
  slug: string;
  title?: string;
  description?: string;
  instagram_url?: string;
};

export const savePage = (body: SavePayload) =>
  request<ProfilePage>("/api/pages", { method: "POST", body: JSON.stringify(body) });

export const getMyPages = () => request<ProfilePage[]>("/api/pages/me");

export const getMyPage = (slug: string) =>
  request<ProfilePage | null>(`/api/pages/me?slug=${encodeURIComponent(slug)}`);

export const getPublicPage = (slug: string) =>
  request<ProfilePage>(`/api/pages?slug=${encodeURIComponent(slug)}`);
