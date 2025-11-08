
import { LoginForm } from "./app/auth/LoginForm";
import { RegisterForm } from "./app/auth/RegisterForm";
import { LandingPage } from "./app/LandingPage";
import { PageBuilder } from "./app/PageBuilder";
import { PageDashboard } from "./app/PageDashboard";
import { PublicProfilePage } from "./app/PublicProfilePage";
import { usePathname } from "./lib/router";
import { navigate } from "./lib/router";

export function AppRouter() {
  const pathname = usePathname() || "/";
  const normalized = pathname === "/" ? "/" : pathname.replace(/\/+$/, "") || "/";
  const segments = normalized.split("/").filter(Boolean);
  const firstSegment = segments[0] || "";

  if (normalized === "/") {
    return <LandingPage />;
  }

  if (normalized === "/login") {
    return <LoginForm onSwitch={() => navigate("/register")} onSuccess={() => navigate("/app")} />;
  }

  if (normalized === "/register") {
    return <RegisterForm onSwitch={() => navigate("/login")} onSuccess={() => navigate("/login")} />;
  }

  if (normalized === "/app") {
    return <PageDashboard />;
  }

  if (segments[0] === "app" && segments[1] === "pagina") {
    const editingSlug = segments[2] || null;
    return <PageBuilder slug={editingSlug ?? undefined} />;
  }

  const reserved = new Set(["login", "register", "app"]);
  if (firstSegment && !reserved.has(firstSegment)) {
    return <PublicProfilePage slug={firstSegment} />;
  }

  // Default route
  return <LandingPage />;
}
