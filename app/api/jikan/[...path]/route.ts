import { JIKAN_BASE, JIKAN_REVALIDATE } from "@/lib/api";

// Only the endpoints the app uses, so this can't be used as an open proxy.
const ALLOWED = /^(anime(\/\d+(\/episodes)?)?|top\/anime|random\/anime)$/;

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!ALLOWED.test(path)) return Response.json({ error: "Not found" }, { status: 404 });

  const random = path === "random/anime";
  const upstream = `${JIKAN_BASE}/${path}${new URL(req.url).search}`;

  let res: Response;
  try {
    res = await fetch(upstream, random ? { cache: "no-store" } : { next: { revalidate: JIKAN_REVALIDATE } });
  } catch (err) {
    const cause = err instanceof Error && err.cause ? `${err.message}: ${String(err.cause)}` : String(err);
    console.error("[jikan-proxy] fetch failed", upstream, cause);
    return failure(502, "Jikan unreachable", cause);
  }

  if (!res.ok) return failure(res.status, `Jikan ${res.status}`);

  const body = await res.text();
  try {
    return Response.json(JSON.parse(body), {
      headers: {
        "Cache-Control": random ? "no-store" : `public, s-maxage=${JIKAN_REVALIDATE}, stale-while-revalidate=86400`,
      },
    });
  } catch {
    // e.g. a Cloudflare challenge page served with 200
    console.error("[jikan-proxy] non-JSON response", upstream, res.status, body.slice(0, 200));
    return failure(502, "Jikan returned non-JSON", body.slice(0, 120));
  }
}

function failure(status: number, error: string, detail?: string) {
  return Response.json({ error, detail }, { status, headers: { "Cache-Control": "no-store" } });
}
