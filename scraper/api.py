import time
from pathlib import Path

import requests

API_URL = "https://naruto.fandom.com/api.php"
USER_AGENT = "NarutoDailyScraper/1.0 (https://github.com/naruto-daily)"
RATE_LIMIT_SECONDS = 1

_session: requests.Session | None = None


def _get_session() -> requests.Session:
    global _session
    if _session is None:
        _session = requests.Session()
        _session.headers.update({"User-Agent": USER_AGENT})
    return _session


def fetch_category_members(category: str = "Category:Characters", limit: int = 500) -> list[str]:
    session = _get_session()
    titles: list[str] = []
    cmcontinue = None

    while True:
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": category,
            "cmlimit": limit,
            "cmtype": "page",
            "format": "json",
        }
        if cmcontinue:
            params["cmcontinue"] = cmcontinue

        resp = session.get(API_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

        members = data.get("query", {}).get("categorymembers", [])
        for m in members:
            titles.append(m["title"])

        cmcontinue = data.get("continue", {}).get("cmcontinue")
        if not cmcontinue:
            break

        time.sleep(RATE_LIMIT_SECONDS)

    return titles


def fetch_infobox_content(character_name: str) -> str | None:
    session = _get_session()
    infobox_title = f"Infobox:{character_name}"

    params = {
        "action": "query",
        "titles": infobox_title,
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
        "format": "json",
    }

    resp = session.get(API_URL, params=params)
    resp.raise_for_status()
    data = resp.json()

    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return None

    page = next(iter(pages.values()))
    if "missing" in page:
        return None

    revisions = page.get("revisions", [])
    if not revisions:
        return None

    content = revisions[0].get("slots", {}).get("main", {}).get("*", "")
    return content if content else None


def resolve_image_url(image_name: str) -> str:
    if not image_name or image_name.strip() == "":
        return "/placeholder.png"

    session = _get_session()
    if ";" in image_name:
        image_name = image_name.split(";")[0].strip()

    file_title = image_name if image_name.startswith("File:") else f"File:{image_name}"
    params = {
        "action": "query",
        "titles": file_title,
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json",
    }

    resp = session.get(API_URL, params=params)
    resp.raise_for_status()
    data = resp.json()

    pages = data.get("query", {}).get("pages", {})
    if not pages:
        return "/placeholder.png"

    page = next(iter(pages.values()))
    imageinfo = page.get("imageinfo", [])
    if not imageinfo:
        return "/placeholder.png"

    url = imageinfo[0].get("url", "")
    if url and not url.startswith("http"):
        url = "https:" + url
    return url if url else "/placeholder.png"


def load_canon_arcs() -> set[str]:
    arcs_data = _load_canon_arcs_data()
    return {a["name"] for a in arcs_data if a.get("canonical", False)}


def get_arc_for_chapter(chapter: int) -> str | None:
    arcs_data = _load_canon_arcs_data()
    for arc in arcs_data:
        if not arc.get("canonical", False):
            continue
        parts = arc.get("manga_chapters", "").split("-")
        if len(parts) != 2:
            continue
        try:
            low, high = int(parts[0].strip()), int(parts[1].strip())
            if low <= chapter <= high:
                return arc["name"]
        except ValueError:
            continue
    return None


def _load_canon_arcs_data() -> list[dict]:
    import json
    data_dir = Path(__file__).resolve().parent.parent / "data"
    canon_path = data_dir / "canon-arcs.json"

    if not canon_path.exists():
        return []

    with open(canon_path) as f:
        data = json.load(f)

    return data.get("arcs", [])
