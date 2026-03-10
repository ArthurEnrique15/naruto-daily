import { Character } from '@/types/character'

export type Feedback = 'correct' | 'partial' | 'wrong'

export interface AttributeResult {
  feedback: Feedback
  value: string | string[]
  direction?: 'before' | 'after'
}

export interface GuessResult {
  character: Character
  village: AttributeResult
  gender: AttributeResult
  species: AttributeResult
  rank: AttributeResult
  status: AttributeResult
  debutArc: AttributeResult
  natureTypes: AttributeResult
  kekkeiGenkai: AttributeResult
  jutsuTypes: AttributeResult
}
