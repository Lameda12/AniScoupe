#!/usr/bin/env python3
"""Build lib/data/mal-tmdb.json from Fribb/anime-lists.

Maps MyAnimeList ids to TMDB ids so FrameXTV (TMDB-keyed) can play them.
Output shape per MAL id: {"m": movieId} or {"t": showId, "s": season, "o": episodeOffset}
(s and o omitted when 1 and 0).

Usage: python3 scripts/build_tmdb_map.py [source.json]   # downloads when no source given
"""
import json
import sys
import urllib.request
from pathlib import Path

SOURCE_URL = "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json"
OUT = Path(__file__).resolve().parent.parent / "lib" / "data" / "mal-tmdb.json"


def load(argv: list[str]) -> list[dict]:
    if len(argv) > 1:
        return json.loads(Path(argv[1]).read_text())
    with urllib.request.urlopen(SOURCE_URL, timeout=60) as res:
        return json.load(res)


def entry(item: dict) -> dict | None:
    tmdb = item.get("themoviedb_id")
    if not isinstance(tmdb, dict):
        return None
    if movies := tmdb.get("movie"):
        return {"m": movies[0]}
    if show := tmdb.get("tv"):
        out = {"t": show}
        if (season := item.get("season", {}).get("tmdb", 1)) != 1:
            out["s"] = season
        if offset := item.get("episode_offset", {}).get("tmdb", 0):
            out["o"] = offset
        return out
    return None


def main() -> int:
    try:
        items = load(sys.argv)
    except Exception as e:
        print(f"failed to load mapping source: {e}", file=sys.stderr)
        return 1

    mapping = {
        str(item["mal_id"]): e
        for item in items
        if isinstance(item.get("mal_id"), int) and (e := entry(item))
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(dict(sorted(mapping.items(), key=lambda kv: int(kv[0]))), separators=(",", ":")))
    print(f"wrote {len(mapping)} entries to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
