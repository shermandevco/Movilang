// Kopia ciężkich danych w Cloudflare R2 (binding AUDIO), żeby nie zużywać transferu Supabase.
//   GET    /l/p/<plik>          plakat (leniwie kopiowany ze Storage Supabase, potem z R2)
//   GET    /l/x/lesson/<uuid>   pełny wiersz lekcji — tylko gdy Supabase lesson_open() zezwala (jak RLS)
//   GET    /l/x/course/<uuid>   wszystkie lekcje kursu — tylko dla zapisanych uczniów / admina / kursu darmowego
//   DELETE /l/x/course/<uuid>   (admin) wyczyść kopię kursu i jego lekcji po edycji
// Kopie wygasają po 7 dniach; po zapisie lekcji panel admina czyści kopię kursu.
const SB_URL = "https://pybzpbkmdupvtsmxlqvr.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnpwYmttZHVwdnRzbXhscXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjMxMjMsImV4cCI6MjEwNzE5OTEyM30.2pMZ-wHdsCXhLnkSH0t5DluePC4TInsCSeSf8vMz6w8";
const TTL = 7 * 24 * 3600 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const POSTER = /^[a-z0-9._-]{3,120}\.(jpg|jpeg|png|webp)$/i;
const JSON_H = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "private, no-store" };

function sbHeaders(auth) { return { apikey: SB_ANON, Authorization: /^Bearer\s+\S+/.test(auth || "") ? auth : "Bearer " + SB_ANON }; }
async function sbJson(path, auth) { const r = await fetch(SB_URL + path, { headers: sbHeaders(auth) }); if (!r.ok) throw new Error("sb " + r.status); return r.json(); }
function fresh(obj) { const ts = Number(obj && obj.customMetadata && obj.customMetadata.ts || 0); return ts && Date.now() - ts < TTL; }

async function access(cid, auth) {
  // kurs darmowy → wszyscy; zapisany uczeń lub admin → tak
  const c = await sbJson("/rest/v1/courses?select=price,published&id=eq." + cid, auth).catch(() => []);
  if (c[0] && /^\s*(0|free|darmo|za darmo|безкошт)/i.test(String(c[0].price || ""))) return true;
  if (!/^Bearer\s+\S+/.test(auth || "")) return false;
  const [e, p] = await Promise.all([
    sbJson("/rest/v1/enrollments?select=course_id&course_id=eq." + cid, auth).catch(() => []),
    fetch(SB_URL + "/auth/v1/user", { headers: sbHeaders(auth) }).then(r => r.ok ? r.json() : null).then(u => u ? sbJson("/rest/v1/profiles?select=role&id=eq." + u.id, auth) : []).catch(() => [])
  ]);
  return e.length > 0 || (p[0] && p[0].role === "admin");
}
async function isAdmin(auth) {
  if (!/^Bearer\s+\S+/.test(auth || "")) return false;
  const u = await fetch(SB_URL + "/auth/v1/user", { headers: sbHeaders(auth) }).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!u) return false;
  const p = await sbJson("/rest/v1/profiles?select=role&id=eq." + u.id, auth).catch(() => []);
  return p[0] && p[0].role === "admin";
}

export async function onRequest({ request, env, params }) {
  const parts = [].concat(params.path || []);
  if (!env.AUDIO) return new Response("R2 binding missing", { status: 503 });
  const auth = request.headers.get("Authorization") || "";
  const R2 = env.AUDIO;

  /* plakaty */
  if (parts[0] === "p" && parts.length === 2 && POSTER.test(parts[1]) && request.method === "GET") {
    const key = "posters/" + parts[1];
    let obj = await R2.get(key);
    if (!obj) {
      const r = await fetch(SB_URL + "/storage/v1/object/public/posters/" + encodeURIComponent(parts[1]));
      if (!r.ok) return new Response("not found", { status: 404 });
      const buf = await r.arrayBuffer();
      const type = r.headers.get("Content-Type") || "image/jpeg";
      await R2.put(key, buf, { httpMetadata: { contentType: type, cacheControl: "public, max-age=31536000, immutable" } });
      return new Response(buf, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" } });
    }
    return new Response(obj.body, { headers: { "Content-Type": obj.httpMetadata && obj.httpMetadata.contentType || "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable", ETag: obj.httpEtag } });
  }

  if (parts[0] !== "x" || parts.length !== 3 || !UUID.test(parts[2])) return new Response("bad path", { status: 400 });
  const kind = parts[1], id = parts[2];

  /* jedna lekcja (te same dane co REST Supabase /lessons?id=eq.) */
  if (kind === "lesson" && request.method === "GET") {
    const open = await fetch(SB_URL + "/rest/v1/rpc/lesson_open", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, sbHeaders(auth)), body: JSON.stringify({ p_lesson: id }) }).then(r => r.ok ? r.json() : false).catch(() => false);
    if (open !== true) return new Response("forbidden", { status: 403 });
    const key = "lx/lesson/" + id + ".json";
    const obj = await R2.get(key);
    if (obj && fresh(obj)) return new Response(obj.body, { headers: JSON_H });
    const rows = await sbJson("/rest/v1/lessons?select=*&id=eq." + id, auth).catch(() => null);
    if (!rows) return obj ? new Response(obj.body, { headers: JSON_H }) : new Response("upstream", { status: 502 });
    if (!rows[0]) return new Response("null", { status: 404, headers: JSON_H });
    const body = JSON.stringify(rows[0]);
    await R2.put(key, body, { customMetadata: { ts: String(Date.now()), cid: rows[0].course_id } });
    return new Response(body, { headers: JSON_H });
  }

  /* cały kurs — tylko z dostępem */
  if (kind === "course" && request.method === "GET") {
    if (!(await access(id, auth))) return new Response("forbidden", { status: 403 });
    const key = "lx/course/" + id + ".json";
    const obj = await R2.get(key);
    if (obj && fresh(obj)) return new Response(obj.body, { headers: JSON_H });
    const rows = await sbJson("/rest/v1/lessons?select=*&course_id=eq." + id + "&order=num.asc", auth).catch(() => null);
    if (!rows) return obj ? new Response(obj.body, { headers: JSON_H }) : new Response("upstream", { status: 502 });
    const body = JSON.stringify(rows);
    await R2.put(key, body, { customMetadata: { ts: String(Date.now()) } });
    return new Response(body, { headers: JSON_H });
  }

  /* admin: wyczyść kopię po edycji */
  if (kind === "course" && request.method === "DELETE") {
    if (!(await isAdmin(auth))) return new Response("admin only", { status: 403 });
    const key = "lx/course/" + id + ".json";
    const obj = await R2.get(key);
    const ids = new Set();
    if (obj) { try { (await obj.json()).forEach(l => ids.add(l.id)); } catch (e) {} }
    const extra = new URL(request.url).searchParams.get("lessons");
    if (extra) extra.split(",").filter(x => UUID.test(x)).forEach(x => ids.add(x));
    await R2.delete([key].concat([...ids].map(x => "lx/lesson/" + x + ".json")));
    return Response.json({ ok: true, purged: ids.size });
  }
  return new Response("method", { status: 405 });
}
