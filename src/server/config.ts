// Centralized server configuration values

const envSource = (() => {
  if (typeof Bun !== "undefined" && (Bun as any)?.env) {
    return (Bun as any).env as Record<string, string | undefined>;
  }
  if (typeof process !== "undefined" && process.env) {
    return process.env as Record<string, string | undefined>;
  }
  return {} as Record<string, string | undefined>;
})();

// Secrets: read from environment (.env) with sensible fallbacks for dev
export const JWT_SECRET = envSource.JWT_SECRET || "dev_jwt_secret_change_me";
