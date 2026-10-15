const COLORS = ['#00522E', '#B8252B', '#F2A33A', '#2F7DD1', '#7A4DB8', '#2E9E8F', '#D2552B', '#4B4B4B']
export const AVATAR_IDS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']
/** Avatar simple con iniciales/forma sobre color (placeholder sin fotos). */
export function Avatar({ id = 'a1', name = '', size = 40 }: { id?: string; name?: string; size?: number }) {
  const idx = Math.max(0, AVATAR_IDS.indexOf(id)) % COLORS.length
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <div className="grid shrink-0 place-items-center rounded-full font-display font-extrabold text-white" style={{ width: size, height: size, background: COLORS[idx], fontSize: size * 0.45, border: '2px solid rgba(255,255,255,.6)', boxShadow: '0 0 0 2px ' + COLORS[idx] }} aria-label={`Avatar de ${name}`}>
      {initial}
    </div>
  )
}
