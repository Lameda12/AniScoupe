import { JIKAN_BASE, JIKAN_REVALIDATE } from "@/lib/api";

// Only the endpoints the app uses, so this can't be used as an open proxy.
const ALLOWED = /^(anime(\/\d+(\/episodes)?)?|top\/anime|random\/anime)$/;

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join("/");
  if (!ALLOWED.test(path)) return Response.json({ error: "Not found" }, { status: 404 });

  const random = path === "random/anime";
  const upstream = `${JIKAN_BASE}/${path}${new URL(req.url).search}`;

  try {
    const res = await fetch(upstream, random ? { cache: "no-store" } : { next: { revalidate: JIKAN_REVALIDATE } });
    if (!res.ok) {
      return Response.json({ error: `Jikan ${res.status}` }, { status: res.status, headers: { "Cache-Control": "no-store" } });
    }
    return Response.json(await res.json(), {
      headers: {
        "Cache-Control": random
          ? "no-store"
          : `public, s-maxage=${JIKAN_REVALIDATE}, stale-while-revalidate=86400`,
      },
    });
  } catch {
    return Response.json({ error: "Jikan unreachable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
