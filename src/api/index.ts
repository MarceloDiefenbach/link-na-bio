// Barrel centralizado para autenticação e páginas públicas
import * as auth from "./auth";
import * as pages from "./pages";

export const api = {
  ...auth,
  ...pages,
};

export type { ApiResponse } from "./http";
