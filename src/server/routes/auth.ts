import { isDBConfigured, getPool } from "../db";
import { signJWT, verifyJWT } from "../jwt";
import { JWT_SECRET } from "../config";
import { buildAuthCookie, json, parseCookies, readJSON } from "../api-helpers";

export function authRoutes() {
  return {
    "/api/auth/register": {
      async POST(req: Request) {
        if (!isDBConfigured()) {
          console.warn("❌ [Auth] Database pool not configured");
          return json(503, { error: "Database not configured" });
        }

        const body = await readJSON<{
          name?: string;
          email?: string;
          password?: string;
        }>(req);
        if (!body) return json(400, { error: "JSON inválido" });

        const name = (body.name || "").trim();
        const email = (body.email || "").toLowerCase().trim();
        const password = body.password || "";

        if (!name || !email || !password)
          return json(400, { error: "Preencha todos os campos" });
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
          return json(400, { error: "Email inválido" });
        if (password.length < 6)
          return json(400, { error: "Senha deve ter no mínimo 6 caracteres" });

        try {
          const pool = await getPool();
          const [rows] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
          const exists = Array.isArray(rows) && (rows as any[]).length > 0;
          if (exists) return json(409, { error: "Email já cadastrado" });

          const hash = await Bun.password.hash(password);
          const [userRes]: any = await pool.query(
            "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 0)",
            [name, email, hash]
          );
          const id = userRes.insertId as number;

          const token = signJWT(
            { sub: id, email, is_admin: false },
            JWT_SECRET,
            60 * 60 * 24 * 30
          );
          const cookie = buildAuthCookie(req, token);
          return json(
            201,
            { id, name, email, is_admin: false, token },
            { "Set-Cookie": cookie }
          );
        } catch (e: any) {
          console.error("Register error:", e);
          return json(500, { error: "Erro interno" });
        }
      },
    },

    "/api/auth/login": {
      async POST(req: Request) {
        if (!isDBConfigured()) return json(503, { error: "Database not configured" });

        const body = await readJSON<{ email?: string; password?: string }>(req);
        if (!body) return json(400, { error: "JSON inválido" });

        const email = (body.email || "").toLowerCase().trim();
        const password = body.password || "";
        if (!email || !password) return json(400, { error: "Preencha todos os campos" });

        try {
          const pool = await getPool();
          const [rows]: any = await pool.query(
            "SELECT id, is_admin, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
            [email]
          );
          const user = rows?.[0];
          if (!user) return json(401, { error: "Credenciais inválidas" });

          const ok = await Bun.password.verify(password, user.password_hash);
          if (!ok) return json(401, { error: "Credenciais inválidas" });

          const token = signJWT(
            {
              sub: user.id,
              email: user.email,
              is_admin: !!user.is_admin,
            },
            JWT_SECRET,
            60 * 60 * 24 * 30
          );
          const cookie = buildAuthCookie(req, token);
          return json(
            200,
            {
              id: user.id,
              name: user.name,
              email: user.email,
              is_admin: !!user.is_admin,
              token,
            },
            { "Set-Cookie": cookie }
          );
        } catch (e: any) {
          console.error("Login error:", e);
          return json(500, { error: "Erro interno" });
        }
      },
    },

    "/api/auth/logout": {
      async POST(req: Request) {
        const cookie = buildAuthCookie(req, "", 0);
        return json(200, { ok: true }, { "Set-Cookie": cookie });
      },
    },

    "/api/auth/me": async (req: Request) => {
      const cookies = parseCookies(req.headers.get("cookie"));
      let token = cookies["token"];

      const auth = req.headers.get("authorization");
      if (!token && auth && auth.startsWith("Bearer ")) token = auth.slice(7);
      if (!token) return json(401, { error: "Não autenticado" });

      const res = verifyJWT(token, JWT_SECRET);
      if (!res.valid || !res.payload?.sub)
        return json(401, { error: res.error || "Token inválido" });
      if (!isDBConfigured()) return json(503, { error: "Database not configured" });

      try {
        const pool = await getPool();
        const [rows]: any = await pool.query(
          "SELECT id, is_admin, name, email FROM users WHERE id = ? LIMIT 1",
          [res.payload.sub]
        );
        const user = rows?.[0];
        if (!user) return json(404, { error: "Usuário não encontrado" });
        return json(200, user);
      } catch (e: any) {
        console.error("Me error:", e);
        return json(500, { error: "Erro interno" });
      }
    },
  } as Record<string, any>;
}
