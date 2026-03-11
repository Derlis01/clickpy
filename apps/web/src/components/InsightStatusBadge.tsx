import { Chip } from '@heroui/react'

export function InsightStatusBadge({ type }: { type: 'positivo' | 'negativo' | 'neutral' }) {
  const colors = {
    positivo: 'success',
    negativo: 'danger',
    neutral: 'warning'
  } as const

  const labels = {
    positivo: 'Oportunidad',
    negativo: 'Atención',
    neutral: 'Sugerencia'
  }

  return (
    <Chip color={colors[type]} variant='flat' size='sm'>
      {labels[type]}
    </Chip>
  )
}
