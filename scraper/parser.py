import re
import sys
import unicodedata
from typing import Any

import api
import constants

_BORUTO_SENTINEL = "__boruto__"


def _parse_infobox_params(wikitext: str) -> dict[str, str]:
    params: dict[str, str] = {}
    start = wikitext.find("{{Infobox/Naruto/Character")
    if start < 0:
        return params

    body_start = wikitext.find("\n", start) + 1
    if body_start <= 0:
        return params

    depth = 1
    pos = start + 2
    body = ""

    while depth > 0 and pos < len(wikitext):
        next_open = wikitext.find("{{", pos)
        next_close = wikitext.find("}}", pos)
        if next_close < 0:
            break
        if 0 <= next_open < next_close:
            depth += 1
            pos = next_open + 2
        else:
            depth -= 1
            if depth == 0:
                body = wikitext[body_start:next_close]
                break
            pos = next_close + 2

    if not body:
        return params
    current_key = None
    current_val: list[str] = []

    for line in body.split("\n"):
        key_match = re.match(r"\|\s*([^=]+)\s*=\s*(.*)", line)
        if key_match:
            if current_key:
                val = " ".join(current_val).strip()
                val = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", val)
                val = re.sub(r"\[\[([^\]]+)\]\]", r"\1", val)
                val = re.sub(r"\{\{Translation\|([^}|]+)\}\}", r"\1", val)
                val = re.sub(r"\{\{[^}]+\}\}", "", val).strip()
                if val:
                    params[current_key] = val

            current_key = key_match.group(1).strip().lower().replace(" ", "_")
            rest = key_match.group(2).strip()
            current_val = [rest] if rest else []
        elif current_key and line.strip().startswith("|"):
            continue
        elif current_key and line.strip():
            current_val.append(line.strip())

    if current_key:
        val = " ".join(current_val).strip()
        val = re.sub(r"\[\[([^\]|]+)\|([^\]]+)\]\]", r"\2", val)
        val = re.sub(r"\[\[([^\]]+)\]\]", r"\1", val)
        val = re.sub(r"\{\{Translation\|([^}|]+)\}\}", r"\1", val)
        val = re.sub(r"\{\{[^}]+\}\}", "", val).strip()
        if val:
            params[current_key] = val

    return params


def _slug(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    slug = ascii_text.lower().replace(" ", "-")
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    return slug or "unknown"


def _extract_name(params: dict[str, str], page_title: str) -> str | None:
    for key in ("english", "title", "name"):
        if key in params:
            val = params[key].split("~~")[0].strip()
            if val:
                return val
    return page_title if page_title else None


def _extract_image(params: dict[str, str]) -> str:
    for key in ("image_name", "imagename", "image"):
        if key in params:
            val = params[key].split(";")[0].strip()
            if val:
                return api.resolve_image_url(val)
    return "/placeholder.png"


def _extract_village(params: dict[str, str]) -> list[str]:
    for key in ("affiliations", "affiliation", "village"):
        if key in params:
            raw = params[key]
            raw = re.sub(r"~~[^,]+", "", raw)
            raw = re.sub(r"~[^,]+", "", raw)
            parts = [p.strip() for p in re.split(r"[,;]", raw) if p.strip()]
            result = []
            for p in parts:
                p_clean = re.sub(r"\[\[[^\]]+\]\]", "", p).strip()
                if not p_clean or "anime only" in p_clean.lower() or "movie only" in p_clean.lower():
                    continue
                normalized = constants.VILLAGE_ALIASES.get(p_clean.lower(), p_clean)
                if normalized and normalized not in result:
                    result.append(normalized)
            if result:
                return sorted(result)
    return []


def _extract_rank(params: dict[str, str]) -> str:
    ranks: list[str] = []
    for key, val in params.items():
        if key.startswith("rank") and val:
            r = val.split("~~")[0].strip()
            if r and r in constants.RANK_VALUES:
                ranks.append(r)
            elif r:
                normalized = r.replace("ō", "o").replace("ū", "u")
                for rv in constants.RANK_VALUES:
                    if rv.lower() == normalized.lower():
                        ranks.append(rv)
                        break

    if not ranks:
        return "N/A"

    best_idx = -1
    for r in ranks:
        try:
            idx = constants.RANK_ORDER.index(r)
            if idx > best_idx:
                best_idx = idx
        except ValueError:
            pass
    return constants.RANK_ORDER[best_idx] if best_idx >= 0 else ranks[0]


def _extract_kekkei_genkai(params: dict[str, str]) -> list[str]:
    for key in ("kekkei_genkai", "kekkeigenkai"):
        if key in params:
            raw = params[key]
            raw = re.sub(r"~~[^,]+", "", raw)
            parts = [p.strip().lower() for p in re.split(r"[,~]", raw) if p.strip()]
            result = set()
            for p in parts:
                cat = constants.KKG_TO_CATEGORY.get(p)
                if cat:
                    result.add(cat)
                else:
                    print(f"[WARN] Unknown kekkei genkai: {p!r}", file=sys.stderr)
            if result:
                return sorted(result)
    return []


def _extract_nature_types(params: dict[str, str]) -> list[str]:
    for key in ("nature_type", "naturetype"):
        if key in params:
            raw = params[key]
            raw = re.sub(r"~~[^,]+", "", raw)
            parts = [p.strip().lower() for p in re.split(r"[,~]", raw) if p.strip()]
            result = set()
            for p in parts:
                p_clean = re.sub(r"\s+release\s*$", "", p)
                nt = constants.NATURE_RELEASE_TO_TYPE.get(p)
                if not nt:
                    nt = constants.NATURE_RELEASE_TO_TYPE.get(p_clean)
                if nt and nt not in result:
                    result.add(nt)
            if result:
                return sorted(result)
    return []


def _extract_jutsu_types(params: dict[str, str], classification: str) -> list[str]:
    result = set()
    jutsu_keys = ("jutsu", "jutsu_list", "jutsulist", "techniques")
    text_parts = [params[k] for k in jutsu_keys if k in params and params[k]]
    combined = (" ".join(text_parts) if text_parts else " ".join(params.values())).lower()
    for pattern, jtype in constants.JUTSU_PATTERNS:
        if pattern in combined and jtype not in result:
            result.add(jtype)
    if "sage" in classification.lower() or "senjutsu" in combined:
        result.add("Senjutsu")
    if "jinch" in classification.lower():
        result.add("Ninjutsu")
    if not result:
        result.add("Ninjutsu")
    return sorted(result)


def _extract_status(params: dict[str, str]) -> str | None:
    for key in ("deceased_state", "deceasedstate", "status"):
        if key in params:
            val = params[key].split("~~")[0].strip().lower()
            return constants.STATUS_MAP.get(val)
    return None


def _extract_debut_arc(params: dict[str, str], arcs_data: list[dict]) -> str | None:
    if params.get("boruto", "").strip().lower() == "yes":
        return _BORUTO_SENTINEL
    for key in ("manga_debut", "mangadebut", "debut_manga", "debutmanga"):
        if key in params:
            val = params[key].strip()
            if "boruto" in val.lower():
                return _BORUTO_SENTINEL
            match = re.search(r"\d+", val)
            if match:
                chapter = int(match.group())
                return api.get_arc_for_chapter(chapter, arcs_data)
    return None


def _extract_gender(params: dict[str, str]) -> str:
    for key in ("gender",):
        if key in params:
            val = params[key].split("~~")[0].strip().lower()
            return constants.GENDER_MAP.get(val, "Unknown")
    return "Unknown"


def _extract_species(params: dict[str, str]) -> list[str]:
    result = set()
    raw = params.get("species", "")
    if raw:
        raw = re.sub(r"~~[^,]+", "", raw)
        parts = [p.strip() for p in re.split(r"[,~]", raw) if p.strip()]
        for p in parts:
            p_clean = re.sub(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]", r"\1", p).strip()
            p_lower = p_clean.lower()
            sp = constants.SPECIES_MAP.get(p_lower)
            if sp is None and p_clean:
                sp = p_clean.title()
            if sp:
                result.add(sp)
    if not result:
        result.add("Human")
    return sorted(result)


def parse_character(
    wikitext: str,
    page_title: str,
    canon_arcs: set[str],
    arcs_data: list[dict],
) -> tuple[dict[str, Any] | None, str | None]:
    params = _parse_infobox_params(wikitext)
    if not params:
        return None, "missing_data"

    name = _extract_name(params, page_title)
    if not name:
        return None, "missing_data"

    if "(" in page_title:
        name = page_title

    status = _extract_status(params)
    if status is None:
        return None, "missing_data"

    debut_arc = _extract_debut_arc(params, arcs_data)
    if debut_arc == _BORUTO_SENTINEL:
        return None, "boruto"
    if not debut_arc:
        return None, "missing_data"

    if debut_arc not in canon_arcs:
        return None, "filler"

    classification = params.get("classification", "")

    character = {
        "id": _slug(page_title),
        "name": name,
        "imageUrl": _extract_image(params),
        "village": _extract_village(params),
        "rank": _extract_rank(params),
        "kekkeiGenkai": _extract_kekkei_genkai(params),
        "natureTypes": _extract_nature_types(params),
        "jutsuTypes": _extract_jutsu_types(params, classification),
        "status": status,
        "debutArc": debut_arc,
        "gender": _extract_gender(params),
        "species": _extract_species(params),
    }

    return character, None
