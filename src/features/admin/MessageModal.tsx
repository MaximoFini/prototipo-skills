import { useState } from 'react'
import { DEFAULT_TEMPLATE, fillTemplate, firstName, type AdminStudent } from '@/data/admin'
import { AButton, AdminModal, inputCls } from './ui'

const SINGLE_FALLBACK = '¡Hola {nombre}! Te extrañamos en Skills Go. Tu racha de {n} días te espera. ¿Retomamos hoy?'

/** Mock de WhatsApp: mensaje sugerido y editable. Con varios alumnos pide confirmación. */
export function MessageModal({ targets, onClose, onSent }: { targets: AdminStudent[]; onClose: () => void; onSent: (ids: number[]) => void }) {
  const bulk = targets.length > 1
  const one = targets[0]
  const [text, setText] = useState(bulk ? DEFAULT_TEMPLATE : fillTemplate(SINGLE_FALLBACK, one))
  const [confirming, setConfirming] = useState(false)
  const ids = targets.map((t) => t.id)

  if (confirming) {
    return (
      <AdminModal title="Confirmá el envío" onClose={() => setConfirming(false)}>
        <p className="text-sm text-go-text">
          Vas a enviar este mensaje a <strong>{targets.length} alumnos</strong>. Es una demo: no se manda nada real.
        </p>
        <p className="mt-3 rounded border border-go-border bg-go-surface p-3 text-sm italic text-go-text">{fillTemplate(text, one)}</p>
        <div className="mt-5 flex justify-end gap-2">
          <AButton variant="light" onClick={() => setConfirming(false)}>Volver</AButton>
          <AButton data-autofocus onClick={() => onSent(ids)}>Sí, enviar a todos</AButton>
        </div>
      </AdminModal>
    )
  }
  return (
    <AdminModal title={bulk ? `Enviar mensaje a ${targets.length} alumnos` : `Mensaje para ${firstName(one.name)}`} onClose={onClose}>
      <label htmlFor="msg-text" className="mb-1 block text-sm font-medium text-go-text">
        Mensaje sugerido (podés editarlo){bulk && <span className="font-normal text-go-muted"> · {'{nombre}'} y {'{n}'} se completan con los datos de cada alumno</span>}
      </label>
      <textarea id="msg-text" data-autofocus rows={5} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} w-full resize-none`} />
      {!bulk && (
        <p className="mt-2 text-xs text-go-muted">
          Para: {one.name} · {one.commission} · {one.daysInactive === 0 ? 'practicó hoy' : `${one.daysInactive} días sin practicar`}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <AButton variant="light" onClick={onClose}>Cancelar</AButton>
        <AButton disabled={!text.trim()} onClick={() => (bulk ? setConfirming(true) : onSent(ids))}>
          {bulk ? 'Revisar y enviar' : 'Enviar por WhatsApp (demo)'}
        </AButton>
      </div>
    </AdminModal>
  )
}
