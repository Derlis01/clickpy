'use client'

import { use, useEffect, useState } from 'react'
import { Spinner } from '@heroui/react'
import useTableSessionStore, { getStoredSession } from '@/store/tableSessionStore'
import { useTableSocket } from '@/hooks/useTableSocket'
import JoinForm from './components/JoinForm'
import CommerceProducts from '../../components/CommerceProducts'
import axios from 'axios'
import { Commerce } from '@/types/PublicCommerceDataResponse'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

interface PageProps {
  params: Promise<{ slug: string; tableId: string }>
}

export default function MesaPage({ params }: PageProps) {
  const { slug, tableId } = use(params)
  const { sessionId, setSession, setTableNumber } = useTableSessionStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commerceData, setCommerceData] = useState<Commerce | null>(null)
  const [primaryColor, setPrimaryColor] = useState<string | null>(null)

  // Check for existing session in localStorage + fetch table number + org color
  useEffect(() => {
    const init = async () => {
      const stored = getStoredSession(tableId)
      if (stored) {
        setSession(stored.sessionId, stored.token, stored.name, tableId)
      }
      // Fetch table info + org color in parallel
      try {
        const [sessionRes, orgRes] = await Promise.all([
          axios.get(`${API_URL}/public/mesa/${tableId}/session`).catch(() => null),
          axios.get(`${API_URL}/public/org/${slug}`).catch(() => null)
        ])
        if (sessionRes?.data?.table_number != null) {
          setTableNumber(sessionRes.data.table_number)
        }
        if (orgRes?.data?.organization?.primary_color) {
          setPrimaryColor(orgRes.data.organization.primary_color)
        }
      } catch { /* ignore */ }
      setIsLoading(false)
    }
    init()
  }, [tableId, slug, setSession, setTableNumber])

  // Fetch commerce data for the catalog
  useEffect(() => {
    if (!sessionId) return

    const fetchCommerce = async () => {
      try {
        const [orgRes, branchesRes] = await Promise.all([
          axios.get(`${API_URL}/public/org/${slug}`),
          axios.get(`${API_URL}/public/org/${slug}/branches`)
        ])

        const org = orgRes.data.organization
        const branches = branchesRes.data.branches ?? []
        const main = branches.find((b: any) => b.is_main) ?? branches[0]
        const pm = main?.payment_methods ?? {}
        const sm = main?.shipping_methods ?? {}

        setCommerceData({
          id: org.id,
          organizationId: org.id,
          commerceName: org.name ?? '',
          commerceLogo: org.logo ?? '',
          commerceBanner: org.banner ?? '',
          commercePhone: org.phone ?? '',
          commerceSlug: org.slug ?? '',
          commercePrimaryColor: org.primary_color ?? '',
          commerceCategory: org.category ?? '',
          commerceAddress: main?.address ?? '',
          commerceInstagram: org.instagram ?? '',
          commerceFacebook: org.facebook ?? '',
          commerceTiktok: org.tiktok ?? '',
          commerceSchedule: main?.schedule ?? [],
          askPaymentMethod: main?.ask_payment_method ?? false,
          paymentMethods: {
            cash: pm.cash?.enabled ?? false,
            qr: pm.qr?.enabled ?? false,
            transfer: pm.transfer?.enabled ?? false,
            paymentLink: pm.paymentLink?.enabled ?? false,
          },
          shippingMethods: {
            pickup: sm.pickup?.enabled ?? false,
            delivery: sm.delivery?.enabled ?? false,
            dinein: sm.dinein?.enabled ?? false,
          }
        })
      } catch (err) {
        console.error('Error fetching commerce:', err)
      }
    }

    fetchCommerce()
  }, [sessionId, slug])

  const handleJoin = async (name: string) => {
    setIsJoining(true)
    setError(null)

    try {
      const sessionRes = await axios.get(`${API_URL}/public/mesa/${tableId}/session`)
      const session = sessionRes.data

      const token = crypto.randomUUID()

      await axios.post(`${API_URL}/public/mesa/${tableId}/join`, { token, name })

      setSession(session.id, token, name, tableId, session.table_number)
    } catch (err: any) {
      console.error('Error joining session:', err)
      setError('No se pudo unir a la mesa. Intenta de nuevo.')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Spinner size='lg' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
        <div className='text-center'>
          <p className='text-red-500 mb-4'>{error}</p>
          <button onClick={() => setError(null)} className='text-primary-600 underline'>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return <JoinForm onJoin={handleJoin} isLoading={isJoining} primaryColor={primaryColor} />
  }

  // In session → show storefront with mesa mode
  return <MesaStorefront commerceData={commerceData} />
}

// Separate component to use the socket hook (needs sessionId to be set)
function MesaStorefront({ commerceData }: { commerceData: Commerce | null }) {
  // Socket connection + cart bridge are handled by the singleton manager
  useTableSocket()

  if (!commerceData) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <Spinner size='lg' />
      </div>
    )
  }

  return (
    <div className='relative bg-[#F9F7F4] min-h-screen'>
      <CommerceProducts commerceData={commerceData} isMesaMode />
    </div>
  )
}
