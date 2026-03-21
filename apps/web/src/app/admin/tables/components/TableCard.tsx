'use client'

import { useState, useRef, useEffect } from 'react'
import { Table } from '@clickpy/shared'
import { Spinner, Tooltip } from '@heroui/react'
import { Trash, Download, ExternalLink } from 'react-feather'
import useTableStore from '@/store/tableStore'
import useCommerceStore from '@/store/commerceStore'
import { toast } from 'sonner'
import QRCodeStyling from 'qr-code-styling'

interface TableCardProps {
  table: Table
}

export default function TableCard({ table }: TableCardProps) {
  const deleteTable = useTableStore(state => state.deleteTable)
  const commerceSlug = useCommerceStore(state => state.commerceSlug)
  const [isDeleting, setIsDeleting] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const qrInstance = useRef<any>(null)

  const tableUrl =
    typeof window !== 'undefined' && commerceSlug
      ? `${window.location.origin}/${commerceSlug}/mesa/${table.id}`
      : ''

  useEffect(() => {
    if (!tableUrl || !qrRef.current) return

    qrRef.current.innerHTML = ''
    qrInstance.current = new QRCodeStyling({
      width: 120,
      height: 120,
      type: 'svg',
      data: tableUrl,
      margin: 4,
      qrOptions: { errorCorrectionLevel: 'M' },
      dotsOptions: { type: 'extra-rounded', color: '#151515' },
      cornersSquareOptions: { type: 'extra-rounded', color: '#151515' },
      cornersDotOptions: { type: 'dot', color: '#374bff' },
      backgroundOptions: { color: '#ffffff' }
    })
    qrInstance.current.append(qrRef.current)

    return () => {
      if (qrRef.current) qrRef.current.innerHTML = ''
    }
  }, [tableUrl])

  const handleDownload = async () => {
    if (!qrInstance.current) return
    await qrInstance.current.download({
      extension: 'png',
      name: `mesa-${table.number}`
    })
  }

  const handleOpenLink = () => {
    if (tableUrl) window.open(tableUrl, '_blank')
  }

  const handleCopyLink = () => {
    if (tableUrl) {
      navigator.clipboard.writeText(tableUrl)
      toast.success('Link copiado')
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteTable(table.id)
    setIsDeleting(false)
    toast.info('Mesa eliminada')
  }

  return (
    <div className='flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all mb-3'>
      {/* QR preview */}
      <div ref={qrRef} className='shrink-0 rounded-lg overflow-hidden' />

      {/* Info */}
      <div className='flex-1 min-w-0'>
        <span className='text-black font-semibold text-lg'>Mesa {table.number}</span>
        <p
          className='text-gray-400 text-xs truncate cursor-pointer hover:text-gray-600 transition-colors mt-1'
          onClick={handleCopyLink}
          title='Click para copiar'
        >
          {tableUrl}
        </p>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1 shrink-0'>
        <Tooltip content='Abrir link'>
          <button
            onClick={handleOpenLink}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-primary-600'
          >
            <ExternalLink size={16} />
          </button>
        </Tooltip>
        <Tooltip content='Descargar QR'>
          <button
            onClick={handleDownload}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-primary-600'
          >
            <Download size={16} />
          </button>
        </Tooltip>
        <Tooltip content='Eliminar mesa'>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-600'
          >
            {isDeleting ? <Spinner size='sm' /> : <Trash size={16} />}
          </button>
        </Tooltip>
      </div>
    </div>
  )
}
