import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ elevated, padding = 'md', className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`${elevated ? 'glass-strong' : 'glass'} rounded-2xl ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
