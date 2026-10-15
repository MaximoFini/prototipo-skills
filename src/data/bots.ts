/** Alumnos ficticios de la liga (nombre + inicial de apellido) y definición de las ligas. */
export interface BotIdentity {
  name: string
  avatar: string
}

const NAMES = [
  'Valentina R.', 'Mateo G.', 'Sofía L.', 'Benjamín P.', 'Martina S.', 'Santino F.', 'Julieta M.', 'Thiago B.',
  'Camila D.', 'Joaquín A.', 'Catalina V.', 'Lautaro C.', 'Emilia H.', 'Bautista N.', 'Delfina T.', 'Franco K.',
  'Agustina Z.', 'Ignacio O.', 'Milagros E.', 'Tomás Q.', 'Lucía W.', 'Facundo J.', 'Renata Y.', 'Nicolás I.',
  'Abril U.', 'Máximo R.', 'Pilar G.', 'Dante L.', 'Zoe P.', 'Gael S.', 'Bianca M.', 'Lisandro F.',
  'Olivia B.', 'Ramiro D.', 'Mía A.', 'Federico C.', 'Josefina V.', 'Matías H.', 'Antonella N.', 'Ciro T.',
  'Candela K.', 'Lucas Z.', 'Jazmín O.', 'Ian E.', 'Guadalupe Q.', 'Alan W.', 'Micaela J.', 'Gonzalo Y.',
  'Rocío I.', 'Pedro U.', 'Brisa R.', 'Simón G.', 'Malena L.', 'Ezequiel P.', 'Constanza S.', 'Uriel F.',
  'Ailén M.', 'Salvador B.', 'Triana D.', 'Kevin A.',
]

const AVATARS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']

export const BOT_POOL: BotIdentity[] = NAMES.map((name, i) => ({ name, avatar: AVATARS[(i * 3 + 1) % AVATARS.length] }))

export interface LeagueTier {
  name: string
  color: string
  /** Versión oscura para bordes/sombras. */
  dark: string
  /** Clave del glifo que dibuja `TierShield`. */
  icon: 'medal' | 'star' | 'crown' | 'gem'
}

export const LEAGUE_TIERS: LeagueTier[] = [
  { name: 'Bronce', color: '#B5763A', dark: '#7F4F22', icon: 'medal' },
  { name: 'Plata', color: '#A7B0B8', dark: '#6F7A84', icon: 'medal' },
  { name: 'Oro', color: '#F2C94C', dark: '#B8901F', icon: 'star' },
  { name: 'Zafiro', color: '#2F7DD1', dark: '#1F5593', icon: 'gem' },
  { name: 'Rubí', color: '#B8252B', dark: '#821519', icon: 'crown' },
]
