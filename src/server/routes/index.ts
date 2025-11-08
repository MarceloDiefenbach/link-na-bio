import { authRoutes } from "./auth";
import { pageRoutes } from "./pages";

export function buildRoutes(indexHtml: string) {
  const routes: Record<string, any> = {
    ...authRoutes(),
    ...pageRoutes(),
  };

  // Fallback SPA route last
  routes["/*"] = indexHtml;
  return routes;
}
