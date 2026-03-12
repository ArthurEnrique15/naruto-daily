export type Rank = 'Academy Student' | 'Genin' | 'Chunin' | 'Jonin' | 'Anbu' | 'Kage' | 'N/A';

export type Status = 'Alive' | 'Deceased';

export type Gender = 'Male' | 'Female' | 'Unknown';

export interface Character {
  id: string;
  name: string;
  imageUrl: string;
  village: string[];
  rank: Rank;
  kekkeiGenkai: string[];
  natureTypes: string[];
  jutsuTypes: string[];
  status: Status;
  debutArc: string;
  gender: Gender;
  species: string[];
  deletedAt?: string; // ISO timestamp, set when character is soft-deleted
}

/**
 * Character as output by the Python scraper — unfiltered.
 * debutArc may be null (not found) or "__boruto__" (Boruto-only).
 * status may be null (wiki value not recognized).
 */
export interface RawCharacter {
  id: string;
  name: string;
  imageUrl: string;
  village: string[];
  rank: string;
  kekkeiGenkai: string[];
  natureTypes: string[];
  jutsuTypes: string[];
  status: string | null;
  debutArc: string | null;
  gender: string;
  species: string[];
}
