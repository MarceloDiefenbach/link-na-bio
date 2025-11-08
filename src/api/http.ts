export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

export async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const lang =
      typeof window === "undefined" ? "pt" : localStorage.getItem("lang") || "pt";
    const country =
      typeof window === "undefined"
        ? "BR"
        : localStorage.getItem("country") || "BR";
    const res = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
        "X-Lang": lang,
        "X-Country": country,
        ...(init?.headers || {}),
      },
      credentials: "include",
      ...init,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (json as any)?.error || `HTTP ${res.status}` };
    return { ok: true, data: json as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}

