import { isDBConfigured, getPool } from "../pool";
import { createCoreTables } from "./core";

export async function ensureSchema() {
  if (!isDBConfigured()) return false;
  const pool = await getPool();

  await createCoreTables(pool);

  return true;
}
