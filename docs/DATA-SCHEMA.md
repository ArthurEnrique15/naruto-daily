# Data Schema

## Character Type

```typescript
// src/types/character.ts

interface Character {
  // Identity
  id: string                    // Slug, e.g. "naruto-uzumaki"
  name: string                  // Display name, e.g. "Naruto Uzumaki"
  imageUrl: string              // Portrait URL (Narutopedia CDN)

  // Gameplay attributes (9 fields)
  village: string[]             // Affiliations, e.g. ["Konohagakure", "Allied Shinobi Forces"]
  rank: Rank                    // Highest ninja rank achieved
  kekkeiGenkai: KKGCategory[]   // Broad kekkei genkai categories (empty array if none)
  natureTypes: NatureType[]     // Chakra nature types (empty array if none)
  jutsuTypes: JutsuType[]       // Combat style categories
  status: Status                // Current status (end of series)
  debutArc: string              // First canonical manga arc name
  gender: Gender
  species: Species[]            // One or more species tags
}

// Enums / union types

type Rank = 'Academy Student' | 'Genin' | 'Chunin' | 'Special Jonin' | 'Jonin' |
            'Anbu' | 'Kage' | 'N/A'

type KKGCategory = 'Dojutsu' | 'Nature Transformation' | 'Body Enhancement' | 'Other'

type NatureType = 'Fire' | 'Wind' | 'Lightning' | 'Water' | 'Earth' |
                  'Yin' | 'Yang' | 'Yin-Yang'

type JutsuType = 'Ninjutsu' | 'Genjutsu' | 'Taijutsu' | 'Fuinjutsu' |
                 'Senjutsu' | 'Kenjutsu'

type Status = 'Alive' | 'Deceased'

type Gender = 'Male' | 'Female' | 'Unknown'

type Species = 'Human' | 'Jinchuriki' | 'Clone' | 'Bijuu' | 'Otsutsuki' |
               'Cursed Seal User' | 'Puppet'
```

## Example Record

```json
{
  "id": "naruto-uzumaki",
  "name": "Naruto Uzumaki",
  "imageUrl": "https://static.wikia.nocookie.net/naruto/images/...",
  "village": ["Konohagakure", "Allied Shinobi Forces"],
  "rank": "Genin",
  "kekkeiGenkai": [],
  "natureTypes": ["Fire", "Wind", "Lightning", "Water", "Earth", "Yin", "Yang", "Yin-Yang"],
  "jutsuTypes": ["Ninjutsu", "Senjutsu", "Taijutsu"],
  "status": "Alive",
  "debutArc": "Land of Waves Arc",
  "gender": "Male",
  "species": ["Human", "Jinchuriki"]
}
```

```json
{
  "id": "itachi-uchiha",
  "name": "Itachi Uchiha",
  "imageUrl": "https://static.wikia.nocookie.net/naruto/images/...",
  "village": ["Konohagakure", "Akatsuki"],
  "rank": "Anbu",
  "kekkeiGenkai": ["Dojutsu", "Nature Transformation"],
  "natureTypes": ["Fire", "Wind", "Water", "Yin"],
  "jutsuTypes": ["Ninjutsu", "Genjutsu", "Taijutsu"],
  "status": "Deceased",
  "debutArc": "Itachi Pursuit Mission",
  "gender": "Male",
  "species": ["Human"]
}
```

## Field Conventions

### `id`
- Kebab-case slug derived from `name`
- Unique across all characters
- Used as stable identifier (do not change after initial scrape)

### `name`
- English name as used on Narutopedia
- Title case

### `imageUrl`
- Direct URL to character portrait from Narutopedia CDN
- Square crop preferred (character infobox image)

### `village` (array)
- All organizations the character has been affiliated with (manga canon only)
- Full names, e.g. `"Konohagakure"` not `"Konoha"`
- Sorted alphabetically
- Empty array `[]` for characters with no clear affiliation

### `rank`
- **Highest rank ever achieved** in the manga
- Use `"N/A"` for non-ninja characters (e.g. Bijuu, civilians)

### `kekkeiGenkai` (array)
- Broad **category** tags, not specific KKG names (e.g. `"Dojutsu"` not `"Sharingan"`)
- Sorted alphabetically
- Empty array `[]` if no kekkei genkai

### `natureTypes` (array)
- All chakra natures the character can use (including advanced natures derived from KKG)
- Sorted alphabetically
- Empty array `[]` if unknown or N/A

### `jutsuTypes` (array)
- Categories of combat techniques used (not exhaustive jutsu list)
- Sorted alphabetically
- Minimum one entry per character

### `status`
- Status **at the end of the series** (Naruto/Boruto manga)

### `debutArc`
- **First appearance arc** in the canonical manga
- Must match a key in `data/canon-arcs.json`

### `gender`
- Use `"Unknown"` for non-humanoid entities (Bijuu, etc.)

### `species` (array)
- Multiple tags allowed (e.g. a Jinchuriki is `["Human", "Jinchuriki"]`)
- Sorted alphabetically

## canon-arcs.json

```json
{
  "arcs": [
    {
      "id": "land-of-waves",
      "name": "Land of Waves Arc",
      "manga_chapters": "1-33",
      "canonical": true
    },
    {
      "id": "chunin-exams",
      "name": "Chunin Exams Arc",
      "manga_chapters": "34-115",
      "canonical": true
    }
  ]
}
```

### Fields
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Kebab-case slug |
| `name` | string | Display name (matches `character.debutArc`) |
| `manga_chapters` | string | Chapter range (informational) |
| `canonical` | boolean | `true` = included in game; `false` = filler, excluded |

> **Note:** Only arcs with `"canonical": true` are used as valid `debutArc` values.
> The scraper ignores characters whose debut arc has `"canonical": false`.
