# Narutopedia Scraper

Collects character data from Narutopedia (naruto.fandom.com) via the MediaWiki API and writes raw output to `data/characters-raw.json`. Run `npm run filter-data` (or `npm run build-data` for both steps in one go) to produce the final `data/characters.json`.

Filler-only characters are filtered out using `data/canon-arcs.json`.

## Setup

```bash
cd scraper
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Commands

```bash
# Full scrape — writes data/characters-raw.json
python main.py

# Dry run — prints summary without writing files
python main.py --dry-run

# Limit to first N characters (for testing)
python main.py --limit 50

# Scrape and print a single character to stdout (for testing — does not write a file)
python main.py --character "Naruto Uzumaki"

# Validate existing characters.json against schema
python main.py --validate-only
```

## Output

- Writes `../data/characters-raw.json` relative to `scraper/` (raw scraper output)
- Run `npm run filter-data` from the project root to produce the final `../data/characters.json`
- Prints summary: total fetched, skipped (filler), skipped (missing data), written
- Exits with code 0 on success, 1 on critical error
