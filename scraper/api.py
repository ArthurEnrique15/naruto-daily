import time
from pathlib import Path

import requests

API_URL = "https://naruto.fandom.com/api.php"
USER_AGENT = "NarutoDailyScraper/1.0 (https://github.com/naruto-daily)"
RATE_LIMIT_SECONDS = 1
BATCH_SIZE = 50

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


def fetch_infobox_content_batch(character_names: list[str]) -> dict[str, str | None]:
    """
    Fetch infobox wikitext for up to BATCH_SIZE characters in a single API request.
    Returns a dict mapping character_name -> wikitext (or None if missing/empty).
    """
    session = _get_session()
    infobox_titles = [f"Infobox:{name}" for name in character_names]
    params = {
        "action": "query",
        "titles": "|".join(infobox_titles),
        "prop": "revisions",
        "rvprop": "content",
        "rvslots": "main",
        "format": "json",
    }

    resp = session.get(API_URL, params=params)
    resp.raise_for_status()
    data = resp.json()

    pages = data.get("query", {}).get("pages", {})

    # Build reverse map: "Infobox:Name" -> "Name"
    title_to_name = {f"Infobox:{name}": name for name in character_names}

    results: dict[str, str | None] = {name: None for name in character_names}
    for page in pages.values():
        page_title = page.get("title", "")
        char_name = title_to_name.get(page_title)
        if char_name is None:
            continue
        if "missing" in page:
            continue
        revisions = page.get("revisions", [])
        if not revisions:
            continue
        content = revisions[0].get("slots", {}).get("main", {}).get("*", "")
        if content:
            results[char_name] = content

    return results


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


def resolve_image_url_batch(image_names: list[str]) -> dict[str, str]:
    """
    Fetch CDN URLs for up to BATCH_SIZE images in a single API request.
    Returns a dict mapping original image_name -> url (or /placeholder.png).
    """
    results: dict[str, str] = {}
    # Pre-process: strip ";" variants, add File: prefix
    name_to_file: dict[str, str] = {}
    for name in image_names:
        if not name or not name.strip():
            results[name] = "/placeholder.png"
            continue
        clean = name.split(";")[0].strip()
        file_title = clean if clean.startswith("File:") else f"File:{clean}"
        name_to_file[name] = file_title

    if not name_to_file:
        return results

    # Reverse map: file_title -> list of original names (multiple names may map to same file)
    file_to_names: dict[str, list[str]] = {}
    for name, file_title in name_to_file.items():
        file_to_names.setdefault(file_title, []).append(name)

    session = _get_session()
    file_titles = list(file_to_names.keys())

    for batch_start in range(0, len(file_titles), BATCH_SIZE):
        batch = file_titles[batch_start : batch_start + BATCH_SIZE]
        params = {
            "action": "query",
            "titles": "|".join(batch),
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        }
        resp = session.get(API_URL, params=params)
        resp.raise_for_status()
        pages = resp.json().get("query", {}).get("pages", {})

        found: dict[str, str] = {}
        for page in pages.values():
            title = page.get("title", "")
            imageinfo = page.get("imageinfo", [])
            if imageinfo:
                url = imageinfo[0].get("url", "")
                if url and not url.startswith("http"):
                    url = "https:" + url
                found[title] = url if url else "/placeholder.png"

        for file_title in batch:
            url = found.get(file_title, "/placeholder.png")
            for name in file_to_names[file_title]:
                results[name] = url

        if batch_start + BATCH_SIZE < len(file_titles):
            time.sleep(RATE_LIMIT_SECONDS)

    # Fill any remaining with placeholder
    for name in image_names:
        results.setdefault(name, "/placeholder.png")

    return results


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


def fetch_jutsu_types_batch(character_names: list[str]) -> dict[str, list[str]]:
    """
    Fetch jutsu types for multiple characters using individual SMW queries,
    sleeping once per BATCH_SIZE characters instead of once per character.
    Returns dict mapping character_name -> sorted list of jutsu types.
    """
    import constants
    results: dict[str, list[str]] = {name: [] for name in character_names}
    session = _get_session()

    for i, name in enumerate(character_names):
        resp = session.get(API_URL, params={
            "action": "ask",
            "query": f"[[User_tech.Page::{name}]]|?Jutsu_classification|limit=500",
            "format": "json",
        })
        resp.raise_for_status()
        smw_results = resp.json().get("query", {}).get("results", {})
        types: set[str] = set()
        if isinstance(smw_results, dict):
            for v in smw_results.values():
                classifs = [c.get("fulltext", "") for c in v.get("printouts", {}).get("Jutsu classification", [])]
                if "Cooperation Ninjutsu" in classifs:
                    continue
                for classif in classifs:
                    mapped = constants.JUTSU_CLASSIFICATION_MAP.get(classif)
                    if mapped:
                        types.add(mapped)
        results[name] = sorted(types)

        # Sleep once per BATCH_SIZE queries, not per query
        if (i + 1) % BATCH_SIZE == 0 and i + 1 < len(character_names):
            time.sleep(RATE_LIMIT_SECONDS)

    return results


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
