# Scraper

## Overview

The scraper collects character data from Narutopedia (naruto.fandom.com) via the MediaWiki API.
The pipeline has two steps:

1. **Scraper (Python)** — extracts ALL characters from the wiki, no filtering → `data/characters-raw.json`
2. **Filter script (TypeScript)** — applies game-eligibility rules → `data/characters.json`

`characters-raw.json` is gitignored (intermediate output). The filter script uses `data/canon-arcs.json`
to exclude Boruto, filler-only, and characters with missing required data.

## Data Source

**Narutopedia** — naruto.fandom.com (MediaWiki-based wiki)

Access methods:
1. **MediaWiki API** (preferred) — structured queries, rate-limit friendly
   - Endpoint: `https://naruto.fandom.com/api.php`
   - Can list category members, fetch page content, query infobox data
2. **HTML scraping** (fallback) — BeautifulSoup for fields not exposed via API

## Franchise Scope

Only **Naruto Part I** (manga ch 1–238) and **Naruto Shippuden** (manga ch 239–700) are in scope.
Boruto, movie-only, and filler arcs are excluded by design. The `series` field in `canon-arcs.json`
enforces this: the loader aborts with a `ValueError` if any canonical arc has a `series` value
other than `"naruto"` or `"shippuden"`.

Two complementary filters prevent Boruto characters from leaking in:

- **Boruto string check**: If the `manga_debut` infobox field contains `"Boruto"` (case-insensitive), the character is rejected immediately before any chapter number lookup. This prevents false positives where a Boruto chapter number (e.g. `"56 (Boruto)"`) coincidentally falls within the Naruto chapter range and would otherwise map to a canonical Naruto arc.
- **Chapter-to-arc lookup**: Even without the string qualifier, every chapter number must map to a canonical arc in `canon-arcs.json` to pass.

## Flow

### Step 1: Scraper (Python)

```
1. Fetch character list
   └── MediaWiki API: list all members of Category:Characters

2. For each character page:
   a. Fetch infobox data (MediaWiki API parse or HTML)
   b. Extract attributes → normalize (no filtering)
   c. Include all parseable characters (Boruto, filler, missing status/debutArc included)

3. Build characters list
   └── Sort by id (alphabetical)

4. Write data/characters-raw.json
```

### Step 2: Filter (TypeScript)

```
1. Load canon-arcs.json
   ├── Validate: every canonical arc must have series ∈ {"naruto", "shippuden"}
   └── Build set of canonical arc names

2. Read data/characters-raw.json

3. For each raw character:
   a. Skip if debutArc is "__boruto__" (Boruto-only)
   b. Skip if status or debutArc is null (missing data)
   c. Skip if debutArc not in canonical arc set (filler)
   d. Skip duplicates by id

4. Write data/characters.json (game-ready)
```

## Attribute Extraction

| Attribute | Source | Notes |
|-----------|--------|-------|
| `name` | Infobox: `title` | |
| `imageUrl` | Infobox: `image` | Resolve to full CDN URL |
| `village` | Infobox: `affiliation` | May be multi-value; split and normalize |
| `rank` | Infobox: `rank` | Take highest rank listed |
| `kekkeiGenkai` | Infobox: `kekkei_genkai` | Map to category tags |
| `natureTypes` | Infobox: `nature_type` | Split multi-values |
| `jutsuTypes` | Derived from jutsu list | Categorize listed jutsu |
| `status` | Infobox: `status` | Normalize to Alive/Deceased |
| `debutArc` | Infobox: `debut.manga` or `debut.arc` | Match to canon-arcs.json |
| `gender` | Infobox: `gender` | |
| `species` | Infobox: `species` or `classification` | Map to Species tags |

## Handling Missing Data

| Field | Required? | Fallback |
|-------|-----------|---------|
| `id` | Yes | Derived from name — fail if name missing |
| `name` | Yes | Skip character |
| `imageUrl` | No | Use placeholder image path |
| `village` | No | Empty array `[]` |
| `rank` | Yes | Use `"N/A"` if none found |
| `kekkeiGenkai` | No | Empty array `[]` |
| `natureTypes` | No | Empty array `[]` |
| `jutsuTypes` | Yes | Minimum `["Ninjutsu"]` as fallback |
| `status` | Yes | Skip character if unknown |
| `debutArc` | Yes | Skip character if not in canon-arcs |
| `gender` | No | Use `"Unknown"` |
| `species` | No | Default to `["Human"]` |

## Running the Pipeline

### Setup

```bash
# Python scraper (for step 1)
cd scraper
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Node (for step 2) — from project root
npm install
```

### Commands (from project root)

```bash
# Full scrape — writes data/characters-raw.json (slow, network)
npm run scrape

# Filter raw → game-ready — writes data/characters.json (fast, local)
npm run filter-data

# Validate characters.json against schema
npm run validate-data
```

### Scraper-only options (from `scraper/`)

```bash
# Dry run — prints output without writing files
python main.py --dry-run

# Limit to first N characters (for testing)
python main.py --limit 5

# Scrape a single character (for testing)
python main.py --character "Naruto Uzumaki"
```

### Output

- **Step 1**: Writes `data/characters-raw.json` (gitignored). Summary: fetched, skipped (missing data), written
- **Step 2**: Writes `data/characters.json`. Summary: input count, skipped (boruto/filler/missing/dup), written
- Exits with code `0` on success, `1` on critical error

## Dependencies

`scraper/requirements.txt`:

```
requests>=2.31.0
beautifulsoup4>=4.12.0
lxml>=4.9.0
```

No external databases or auth required — all public MediaWiki API endpoints.

## Rate Limiting

- Respect Wikia/Fandom rate limits: max 1 request/second
- The scraper uses `time.sleep(1)` between character page requests
- MediaWiki API category listing uses `aplimit=500` (max per request) with continuation

## Re-scraping

To update `characters.json` (e.g. after adding new arcs to `canon-arcs.json`):

1. Update `data/canon-arcs.json` if needed
2. Run `npm run scrape` (writes `characters-raw.json`)
3. Run `npm run filter-data` (writes `characters.json`)
4. Review the diff in `characters.json` before committing
5. **Do not manually edit `characters.json`**

To iterate on filter rules without re-scraping: edit `scripts/filter-characters.ts` and run `npm run filter-data`.

## Known Limitations

- Jutsu type categorization requires heuristic mapping (jutsu name → type tag)
- Some characters have incomplete Narutopedia pages — they are skipped
- imageUrl points to Narutopedia CDN — may change if wiki migrates
