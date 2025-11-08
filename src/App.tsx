import { LanguageProvider } from "./contexts/LanguageContext";
import { AppRouter } from "./router";

export function App() {
  return (
    <LanguageProvider>
      <AppRouter />
    </LanguageProvider>
  );
}
