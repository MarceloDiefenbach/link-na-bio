import { verifyJWT } from "./jwt";

export function json(status: number, body: any, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export async function readJSON<T = any>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | null) {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    out[decodeURIComponent(part.slice(0, eq))] = decodeURIComponent(part.slice(eq + 1));
  }
  return out;
}

function isProd() {
  return process.env.NODE_ENV === "production";
}

export function shouldUseSecureCookie(req: Request): boolean {
  const cfg = (process.env.COOKIE_SECURE || "auto").toLowerCase();
  if (cfg === "true") return true;
  if (cfg === "false") return false;
  const xfProto = (req.headers.get("x-forwarded-proto") || "").toLowerCase();
  if (xfProto) return xfProto === "https";
  try {
    const url = new URL(req.url);
    return url.protocol === "https:";
  } catch {
    return isProd();
  }
}

export function buildAuthCookie(
  req: Request,
  token: string,
  maxAgeSeconds = 60 * 60 * 24 * 30,
) {
  const secure = shouldUseSecureCookie(req);
  return `token=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure ? "; Secure" : ""}`;
}

export function getAuthContext(
  req: Request,
  opts: { jwtSecret: string }
): { userId: number; isAdmin: boolean; email?: string } | null {
  const cookies = parseCookies(req.headers.get("cookie"));
  let token = cookies["token"];
  const auth = req.headers.get("authorization");
  if (!token && auth && auth.startsWith("Bearer ")) token = auth.slice(7);
  if (!token) return null;
  const res = verifyJWT(token, opts.jwtSecret);
  if (!res.valid || !res.payload?.sub) return null;
  const userId = Number(res.payload.sub) || null;
  const isAdmin = Boolean((res.payload as any)?.is_admin);
  const email = (res.payload as any)?.email ? String((res.payload as any).email) : null;
  if (!userId) return null;
  return { userId, isAdmin, email: email ?? undefined };
}

// Format a JS Date into MySQL DATETIME in local server timezone (TZ is set to America/Sao_Paulo)
export function toMySQLDateTimeLocal(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  const SS = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${HH}:${MM}:${SS}`;
}

// Format a JS Date into MySQL DATETIME string in a specific timezone
export function toMySQLDateTimeInTZ(d: Date, tz: string): string {
  // Deprecated in floating-time mode. Kept for backward-compat where needed.
  const dateStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
  const timeStr = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(d);
  return `${dateStr} ${timeStr}`;
}

function getTimeZoneOffset(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const data: Record<string, string> = {};
  for (const { type, value } of parts) {
    if (type !== 'literal') data[type] = value;
  }
  const asUTC = Date.UTC(
    Number(data.year),
    Number(data.month) - 1,
    Number(data.day),
    Number(data.hour),
    Number(data.minute),
    Number(data.second),
    0
  );
  return asUTC - date.getTime();
}

export function parseDateTimeInTZ(value: string, timeZone: string): Date | null {
  // Deprecated in floating-time mode. Kept for compatibility where Date is required.
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/[zZ]|[+-]\d\d(?::?\d\d)?$/.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const [datePart, timePartRaw = ""] = trimmed.split(/[T ]/);
  const [yearStr, monthStr, dayStr] = (datePart || "").split('-');
  if (!yearStr || !monthStr || !dayStr) return null;
  const timePart = timePartRaw.replace(/Z$/, '');
  const [hourStr = '0', minuteStr = '0', secondPart = '0'] = timePart.split(':');
  const [secondStr = '0', fractionStr = '0'] = secondPart.split('.');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = Number(secondStr);
  const millisecond = Number((fractionStr || '0').padEnd(3, '0').slice(0, 3));
  if ([year, month, day, hour, minute, second, millisecond].some(n => Number.isNaN(n))) return null;
  const baseUTC = Date.UTC(year, (month || 1) - 1, day || 1, hour, minute, second, millisecond);
  const approx = new Date(baseUTC);
  const offset = getTimeZoneOffset(approx, timeZone);
  return new Date(baseUTC - offset);
}

// Floating-time helpers: operate on 'YYYY-MM-DD HH:MM:SS' without timezone
export function addMinutesMySQL(dt: string, minutes: number): string {
  const [d, t = '00:00:00'] = dt.trim().split(' ');
  let [yy, mm, dd] = d.split('-').map(Number);
  const [HH, MM, SS] = t.split(':').map(Number);
  let total = HH * 60 + MM + minutes;
  let carryDays = Math.floor(total / 1440);
  if (total < 0) carryDays = Math.floor((total - 1439) / 1440);
  total = ((total % 1440) + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  const base = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1));
  base.setUTCDate(base.getUTCDate() + carryDays);
  yy = base.getUTCFullYear();
  mm = base.getUTCMonth() + 1;
  dd = base.getUTCDate();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${yy}-${pad2(mm)}-${pad2(dd)} ${pad2(nh)}:${pad2(nm)}:${pad2(SS || 0)}`;
}

export function addDaysMySQL(dt: string, days: number): string {
  const [d, t = '00:00:00'] = dt.trim().split(' ');
  let [yy, mm, dd] = d.split('-').map(Number);
  const base = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1));
  base.setUTCDate(base.getUTCDate() + days);
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())} ${t}`;
}

export function isMySQLDateTimeString(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s.trim());
}
