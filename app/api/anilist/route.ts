import { ANILIST_REVALIDATE, QUERIES, QueryName, Variables, postAniList } from "@/lib/anilist";

// Cached GET front for AniList's POST-only GraphQL API. Only the app's named queries are allowed.
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const name = params.get("q");
  const raw = params.get("v") ?? "{}";
  if (!name || !(name in QUERIES) || raw.length > 1000) return failure(400, "Bad request");

  let variables: Variables;
  try {
    variables = JSON.parse(raw);
  } catch {
    return failure(400, "Bad variables");
  }

  let res: Response;
  try {
    res = await postAniList(name as QueryName, variables, { next: { revalidate: ANILIST_REVALIDATE } });
  } catch (err) {
    const cause = err instanceof Error && err.cause ? `${err.message}: ${String(err.cause)}` : String(err);
    console.error("[anilist-proxy] fetch failed", name, cause);
    return failure(502, "AniList unreachable", cause);
  }

  const body = await res.text();
  try {
    const json = JSON.parse(body);
    const cacheable = res.ok && json?.data && !json.errors;
    return Response.json(json, {
      status: res.status,
      headers: {
        "Cache-Control": cacheable
          ? `public, s-maxage=${ANILIST_REVALIDATE}, stale-while-revalidate=86400`
          : "no-store",
      },
    });
  } catch {
    console.error("[anilist-proxy] non-JSON response", name, res.status, body.slice(0, 200));
    return failure(502, "AniList returned non-JSON", body.slice(0, 120));
  }
}

function failure(status: number, error: string, detail?: string) {
  return Response.json({ errors: [{ message: error, detail, status }] }, { status, headers: { "Cache-Control": "no-store" } });
}
