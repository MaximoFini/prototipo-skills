export interface Friend {
  id: string
  name: string
  avatar: string
  streak: number
  weekXp: number
  commission: string
}

/** Compañeros ficticios de la academia (mock). */
export const friendsData: Friend[] = [
  { id: 'f1', name: 'Ale', avatar: 'a2', streak: 14, weekXp: 240, commission: 'Teens 2B' },
  { id: 'f2', name: 'Mica', avatar: 'a5', streak: 9, weekXp: 185, commission: 'Teens 2B' },
  { id: 'f3', name: 'Tomi', avatar: 'a4', streak: 6, weekXp: 120, commission: 'Teens 2A' },
  { id: 'f4', name: 'Lucía', avatar: 'a6', streak: 11, weekXp: 210, commission: 'Teens 2B' },
  { id: 'f5', name: 'Joaquín', avatar: 'a7', streak: 3, weekXp: 70, commission: 'Teens 3A' },
  { id: 'f6', name: 'Camila', avatar: 'a1', streak: 8, weekXp: 160, commission: 'Teens 2A' },
  { id: 'f7', name: 'Facu', avatar: 'a8', streak: 2, weekXp: 45, commission: 'Teens 3A' },
  { id: 'f8', name: 'Valen', avatar: 'a3', streak: 5, weekXp: 95, commission: 'Teens 2B' },
]
