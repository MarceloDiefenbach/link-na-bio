import { useEffect, useState } from "react";

export function usePathname() {
  const [path, setPath] = useState<string>(typeof location !== "undefined" ? location.pathname : "/");
  useEffect(() => {
    const onPop = () => setPath(location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return path;
}

export function navigate(to: string) {
  if (location.pathname === to) return;
  history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

