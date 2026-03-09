export type Rank = 'Academy Student' | 'Genin' | 'Chunin' | 'Special Jonin' | 'Jonin' | 'ANBU' | 'Kage' | 'Unknown';

export type Status = 'Alive' | 'Deceased' | 'Incapacitated' | 'Unknown';

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
}
