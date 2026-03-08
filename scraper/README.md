# Narutopedia Scraper

Collects character data from Narutopedia (naruto.fandom.com) via the MediaWiki API and outputs `data/characters.json`. Filters out filler-only characters using `data/canon-arcs.json`.

## Setup

```bash
cd scraper
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Commands

```bash
# Full scrape — writes data/characters.json
python main.py

# Dry run — prints summary without writing files
python main.py --dry-run

# Limit to first N characters (for testing)
python main.py --limit 50

# Scrape a single character (for testing)
python main.py --character "Naruto Uzumaki"

# Validate existing characters.json against schema
python main.py --validate-only
```

## Output

- Writes `../data/characters.json` relative to `scraper/`
- Prints summary: total fetched, skipped (filler), skipped (missing data), written
- Exits with code 0 on success, 1 on critical error
