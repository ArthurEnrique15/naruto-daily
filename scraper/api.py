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

    time.sleep(RATE_LIMIT_SECONDS)
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


def fetch_jutsu_types_for_character(character_name: str) -> list[str]:
    """
    Query Narutopedia SMW for all jutsu a character uses and return
    the set of matching JUTSU_TYPES values (sorted), excluding cooperation techniques.
    """
    import constants
    time.sleep(RATE_LIMIT_SECONDS)
    session = _get_session()
    resp = session.get(API_URL, params={
        "action": "ask",
        "query": f"[[User_tech.Page::{character_name}]]|?Jutsu_classification|limit=500",
        "format": "json",
    })
    resp.raise_for_status()
    results = resp.json().get("query", {}).get("results", {})
    types: set[str] = set()
    if isinstance(results, dict):
        for v in results.values():
            classifs = [c.get("fulltext", "") for c in v.get("printouts", {}).get("Jutsu classification", [])]
            if "Cooperation Ninjutsu" in classifs:
                continue
            for classif in classifs:
                mapped = constants.JUTSU_CLASSIFICATION_MAP.get(classif)
                if mapped:
                    types.add(mapped)
    return sorted(types)


def load_canon_arcs_data() -> list[dict]:
    return _load_canon_arcs_data()


def load_canon_arcs() -> set[str]:
    arcs_data = _load_canon_arcs_data()
    return {a["name"] for a in arcs_data if a.get("canonical", False)}


def get_arc_for_chapter(chapter: int, arcs_data: list[dict] | None = None) -> str | None:
    if arcs_data is None:
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


ALLOWED_SERIES = {"naruto", "shippuden"}


def _load_canon_arcs_data() -> list[dict]:
    import json
    data_dir = Path(__file__).resolve().parent.parent / "data"
    canon_path = data_dir / "canon-arcs.json"

    if not canon_path.exists():
        return []

    with open(canon_path) as f:
        data = json.load(f)

    arcs = data.get("arcs", [])

    for arc in arcs:
        if arc.get("canonical"):
            series = arc.get("series", "")
            if series not in ALLOWED_SERIES:
                raise ValueError(
                    f"canon-arcs.json: arc '{arc.get('id')}' has canonical=true "
                    f"but series='{series}' (must be one of {sorted(ALLOWED_SERIES)})"
                )

    return arcs
