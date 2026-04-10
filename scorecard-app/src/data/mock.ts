export const store = {
  name: 'Home Depot #1907',
  banner: 'Home Depot',
  city: 'Columbus, OH',
  visitStatus: 'Active' as const,
  scorecard: 'Q1 2026 Store Scorecard',
  rep: 'Sarah M.',
}

export const previousSnapshot = {
  score: 142,
  date: 'Mar 12, 2026',
  submittedBy: 'Sarah M.',
  gap: 'Garden Doors',
  opportunity: 'Weed & Feed Endcap',
}

export const checklistItems = [
  { id: 'plant-food-pog', label: 'Plant Food POG', weight: 15 },
  { id: 'chemical-pog', label: 'Chemical POG', weight: 15 },
  { id: 'grass-seed-pog', label: 'Grass Seed POG', weight: 15 },
  { id: 'indoor-soil-pog', label: 'Indoor Soil POG', weight: 10 },
  { id: 'endcap', label: 'Endcap', weight: 15 },
  { id: 'garden-doors', label: 'Garden Doors', weight: 10 },
  { id: 'fenceline', label: 'Fenceline', weight: 10 },
  { id: 'racetrack', label: 'Racetrack', weight: 10 },
]

export const locations = ['Endcap', 'Fenceline', 'Garden Doors', 'Racetrack', 'Other']

export const categories = [
  { id: 'fertilizer', label: 'Fertilizer', icon: 'sprout' },
  { id: 'soils', label: 'Soils', icon: 'layers' },
  { id: 'seed', label: 'Seed', icon: 'wheat' },
  { id: 'weed-feed', label: 'Weed & Feed', icon: 'leaf' },
  { id: 'controls', label: 'Controls', icon: 'shield' },
]

export const productsByCategory: Record<string, string[]> = {
  fertilizer: ['Miracle-Gro All Purpose', 'Miracle-Gro Water Soluble', 'Scotts Turf Builder', 'Osmocote Smart-Release'],
  soils: ['Miracle-Gro Potting Mix', 'Miracle-Gro Garden Soil', 'Scotts Premium Topsoil'],
  seed: ['Scotts Turf Builder Grass Seed', 'EZ Seed Patch & Repair', 'Pennington Annual Ryegrass'],
  'weed-feed': ['Scotts Weed & Feed', 'Scotts Turf Builder + Weed Control', 'Ortho WeedClear'],
  controls: ['Roundup Ready-To-Use', 'Ortho Home Defense', 'Scotts DiseaseEx'],
}

export const quantities = [40, 80, 120, 200, '320+']

export const trellisBotInsights: Record<string, string> = {
  entry: 'Garden Doors missed last 2 visits. Weed & Feed Endcap drove +$1.2K incremental at nearby stores.',
  checklist: 'Grass Seed POG is typically the most-missed item at this banner in Q1. Confirm before moving on.',
  offShelf: 'Endcap with 80+ units of Weed & Feed drove the highest LGOR at comparable HD stores this quarter.',
  photo: 'Photos with visible SKU labels are approved 3× faster by the compliance team.',
  summary: 'Score improved +18 pts vs. last visit. Adding Garden Doors would close the remaining $840 gap.',
}
