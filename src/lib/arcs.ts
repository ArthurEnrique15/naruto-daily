import arcsData from '@/../data/canon-arcs.json'

export function getArcNames(): string[] {
  return (arcsData as { arcs: { name: string }[] }).arcs.map((a) => a.name)
}
