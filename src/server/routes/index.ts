import { authRoutes } from "./auth";

export function buildRoutes(indexHtml: string) {
  const routes: Record<string, any> = {
    ...authRoutes(),
  };

  // Fallback SPA route last
  routes["/*"] = indexHtml;
  return routes;
}