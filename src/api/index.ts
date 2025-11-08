// Barrel centralizado apenas com a API de autenticação
import * as auth from "./auth";

export const api = {
  ...auth,
};

export type { ApiResponse } from "./http";
