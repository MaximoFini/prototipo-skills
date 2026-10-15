import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'xp' | 'ghost'
const styles: Record<Variant, string> = {
  primary: 'bg-go-primary text-white border-go-primary-dark disabled:bg-go-locked disabled:text-go-muted disabled:border-go-border-dark',
  secondary: 'bg-white text-go-primary border-2 border-go-border border-b-4 disabled:text-go-muted',
  danger: 'bg-go-danger text-white border-go-danger-dark disabled:bg-go-locked disabled:text-go-muted disabled:border-go-border-dark',
  xp: 'bg-go-xp text-go-text border-go-xp-dark',
  ghost: 'bg-transparent text-go-primary border-transparent !border-b-0 active:!translate-y-0',
}
export function Button({ variant = 'primary', block, className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; block?: boolean }) {
  return <button type="button" {...p} className={`btn-3d ${styles[variant]} ${block ? 'w-full' : ''} ${className}`} />
}
