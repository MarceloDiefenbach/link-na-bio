import { isDBConfigured, getPool } from "../db";
import { JWT_SECRET } from "../config";
import { getAuthContext, json, readJSON } from "../api-helpers";

const RESERVED_SLUGS = new Set(["login", "register", "app", "api", "auth"]);

type PagePayload = {
  id?: number;
  slug?: string;
  title?: string;
  description?: string;
  instagram_url?: string;
};

function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeInstagram(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed.replace(/^@/, "");
  return `https://instagram.com/${handle}`;
}

export function pageRoutes() {
  return {
    "/api/pages": {
      async POST(req: Request) {
        if (!isDBConfigured()) return json(503, { error: "Database not configured" });
        const auth = getAuthContext(req, { jwtSecret: JWT_SECRET });
        if (!auth) return json(401, { error: "Não autenticado" });

        const body = await readJSON<PagePayload>(req);
        if (!body) return json(400, { error: "JSON inválido" });

        const pageId = typeof body.id === "number" ? body.id : null;
        const slug = sanitizeSlug(body.slug || "");
        if (!slug) return json(400, { error: "Informe um endereço válido" });
        if (slug.length < 3 || slug.length > 40) return json(400, { error: "Slug deve ter entre 3 e 40 caracteres" });
        if (RESERVED_SLUGS.has(slug)) return json(400, { error: "Esse endereço é reservado" });

        const title = (body.title || "").trim().slice(0, 120);
        const description = (body.description || "").trim().slice(0, 600);
        const instagram_url = body.instagram_url ? normalizeInstagram(body.instagram_url) : "";
        if (instagram_url && instagram_url.length > 255) return json(400, { error: "Link do Instagram muito longo" });

        try {
          const pool = await getPool();
          if (pageId) {
            const [rows]: any = await pool.query(
              "SELECT id FROM profile_pages WHERE id = ? AND user_id = ? LIMIT 1",
              [pageId, auth.userId]
            );
            if (!rows?.[0]) return json(404, { error: "Página não encontrada" });
          }

          const [slugOwner]: any = await pool.query(
            "SELECT id, user_id FROM profile_pages WHERE slug = ? LIMIT 1",
            [slug]
          );
          const takenByOther =
            slugOwner?.[0] && slugOwner[0].user_id !== auth.userId && slugOwner[0].id !== pageId;
          if (takenByOther) return json(409, { error: "Esse endereço já está em uso" });

          const values = [slug, title || null, description || null, instagram_url || null];
          let targetId = pageId;
          if (targetId) {
            await pool.query(
              "UPDATE profile_pages SET slug = ?, title = ?, description = ?, instagram_url = ?, updated_at = NOW() WHERE id = ?",
              [...values, targetId]
            );
          } else {
            const [insertRes]: any = await pool.query(
              "INSERT INTO profile_pages (user_id, slug, title, description, instagram_url) VALUES (?, ?, ?, ?, ?)",
              [auth.userId, ...values]
            );
            targetId = insertRes.insertId as number;
          }

          const [rows]: any = await pool.query(
            "SELECT id, slug, title, description, instagram_url FROM profile_pages WHERE id = ? LIMIT 1",
            [targetId]
          );
          const page = rows?.[0];
          return json(pageId ? 200 : 201, page);
        } catch (e: any) {
          console.error("Page upsert error:", e);
          return json(500, { error: "Erro interno" });
        }
      },

      async GET(req: Request) {
        if (!isDBConfigured()) return json(503, { error: "Database not configured" });
        const url = new URL(req.url);
        const slug = sanitizeSlug(url.searchParams.get("slug") || "");
        if (!slug) return json(400, { error: "Informe o slug" });
        try {
          const pool = await getPool();
          const [rows]: any = await pool.query(
            "SELECT slug, title, description, instagram_url FROM profile_pages WHERE slug = ? LIMIT 1",
            [slug]
          );
          const page = rows?.[0];
          if (!page) return json(404, { error: "Página não encontrada" });
          return json(200, page);
        } catch (e: any) {
          console.error("Page fetch error:", e);
          return json(500, { error: "Erro interno" });
        }
      },
    },

    "/api/pages/availability": {
      async GET(req: Request) {
        if (!isDBConfigured()) return json(503, { error: "Database not configured" });
        const auth = getAuthContext(req, { jwtSecret: JWT_SECRET });
        if (!auth) return json(401, { error: "Não autenticado" });

        const url = new URL(req.url);
        const slug = sanitizeSlug(url.searchParams.get("slug") || "");
        const pageIdParam = url.searchParams.get("pageId");
        const pageId = pageIdParam ? Number.parseInt(pageIdParam, 10) : null;

        if (!slug) {
          return json(200, { available: false, message: "Informe um endereço válido." });
        }
        if (slug.length < 3 || slug.length > 40) {
          return json(200, { available: false, message: "O endereço deve ter entre 3 e 40 caracteres." });
        }
        if (RESERVED_SLUGS.has(slug)) {
          return json(200, { available: false, message: "Esse endereço é reservado. Escolha outro." });
        }

        try {
          const pool = await getPool();
          const [rows]: any = await pool.query(
            "SELECT id, user_id FROM profile_pages WHERE slug = ? LIMIT 1",
            [slug]
          );
          const owner = rows?.[0];
          if (!owner) return json(200, { available: true });

          const sameUser = owner.user_id === auth.userId;
          const samePage = typeof pageId === "number" && !Number.isNaN(pageId) && owner.id === pageId;
          if (sameUser || samePage) {
            return json(200, { available: true });
          }

          return json(200, { available: false, message: "Esse endereço já está em uso. Escolha outro." });
        } catch (e: any) {
          console.error("Slug availability error:", e);
          return json(500, { error: "Erro interno" });
        }
      },
    },

    "/api/pages/me": async (req: Request) => {
      if (!isDBConfigured()) return json(503, { error: "Database not configured" });
      const auth = getAuthContext(req, { jwtSecret: JWT_SECRET });
      if (!auth) return json(401, { error: "Não autenticado" });
      try {
        const pool = await getPool();
        const url = new URL(req.url);
        const slugParamRaw = url.searchParams.get("slug");
        const slugParam = slugParamRaw ? sanitizeSlug(slugParamRaw) : "";

        if (slugParam) {
          const [rows]: any = await pool.query(
            "SELECT id, slug, title, description, instagram_url FROM profile_pages WHERE user_id = ? AND slug = ? LIMIT 1",
            [auth.userId, slugParam]
          );
          const page = rows?.[0] || null;
          return json(200, page);
        }

        const [rows]: any = await pool.query(
          "SELECT id, slug, title, description, instagram_url, updated_at FROM profile_pages WHERE user_id = ? ORDER BY updated_at DESC, id DESC",
          [auth.userId]
        );
        return json(200, rows);
      } catch (e: any) {
        console.error("Page me error:", e);
        return json(500, { error: "Erro interno" });
      }
    },
  } as Record<string, any>;
}
