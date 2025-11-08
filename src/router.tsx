
import { LoginForm } from "./app/auth/LoginForm";
import { RegisterForm } from "./app/auth/RegisterForm";
import { BlankPage } from "./app/BlankPage";
import { LandingPage } from "./app/LandingPage";
import { usePathname } from "./lib/router";
import { navigate } from "./lib/router";

export function AppRouter() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <LandingPage />;
  }

  if (pathname === "/login") {
    return <LoginForm onSwitch={() => navigate('/register')} onSuccess={() => navigate('/app/blank')} />;
  }

  if (pathname === "/register") {
    return <RegisterForm onSwitch={() => navigate('/login')} onSuccess={() => navigate('/login')} />;
  }

  if (pathname === "/app/blank") {
    return <BlankPage />;
  }

  // Default route
  return <LandingPage />;
}
