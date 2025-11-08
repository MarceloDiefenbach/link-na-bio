import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fixImageUrl(url: string) {
  try {
    const u = new URL(url);
    // If the original URL is plain HTTP, always proxy it first
    // to avoid any HTTPS upgrade/mixed content issues.
    if (u.protocol === "http:") {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    if (u.hostname.endsWith(".traefik.me") && import.meta.env.BUN_PUBLIC_ASSETS_URL) {
      return `${import.meta.env.BUN_PUBLIC_ASSETS_URL}${u.pathname}`;
    }
    return url;
  } catch {
    if (url.startsWith("/")) {
      return `${import.meta.env.BUN_PUBLIC_ASSETS_URL || ""}${url}`;
    }
    return url;
  }
}

export default { cn, fixImageUrl };
