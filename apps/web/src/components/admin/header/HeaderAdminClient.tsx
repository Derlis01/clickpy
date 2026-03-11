'use client'

import { ExternalLink, LogOut } from 'react-feather'
import useCommerceStore from '@/store/commerceStore'
import useProductStore from '@/store/productStore'
import authHook from '@/hooks/authHook'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useRouter } from 'next/navigation'
import { useRef, useEffect, useMemo, memo } from 'react'

const HeaderAdminClient = memo(function HeaderAdminClient() {
  const initializationDone = useRef(false)
  const initializationPromise = useRef<Promise<void> | null>(null)
  authHook()
  const router = useRouter()
  const { signOut } = useSupabaseAuth()

  const { commerceName, commerceSlug, commerceAddress } = useCommerceStore(
    useMemo(
      () => state => ({
        commerceName: state.commerceName,
        commerceSlug: state.commerceSlug,
        commerceAddress: state.commerceAddress
      }),
      []
    )
  )

  const { products, fetchProducts } = useProductStore(
    useMemo(
      () => state => ({
        products: state.products,
        fetchProducts: state.fetchProducts
      }),
      []
    )
  )

  const resetCommerce = useCommerceStore(state => state.resetStore)
  const resetProducts = useProductStore(state => state.resetStore)
  const fetchCommerce = useCommerceStore(state => state.fetchCommerce)

  useEffect(() => {
    const initializeData = async () => {
      if (initializationDone.current) return
      if (initializationPromise.current) {
        await initializationPromise.current
        return
      }

      const promise = async () => {
        const shouldFetchProducts = products.length === 0
        const shouldFetchCommerce = !commerceAddress

        const promises = []
        if (shouldFetchProducts) promises.push(fetchProducts())
        if (shouldFetchCommerce) promises.push(fetchCommerce())

        if (promises.length > 0) {
          await Promise.all(promises)
        }
        initializationDone.current = true
      }

      initializationPromise.current = promise()
      await initializationPromise.current
      initializationPromise.current = null
    }

    initializeData()
  }, [])

  const logoutHandler = useMemo(() => {
    return async () => {
      resetCommerce()
      resetProducts()
      await signOut()
      router.push('/login')
    }
  }, [resetCommerce, resetProducts, signOut, router])

  const commerceNameClickedHandler = useMemo(() => {
    return () => window.open(`/${commerceSlug}`, '_blank')
  }, [commerceSlug])

  return (
    <header style={{ backgroundColor: '#374bff' }} className='flex h-[70px] z-50 items-center justify-between px-4'>
      <div className='flex items-center gap-3'>
        <h1 className='text-header-semi-bold font-semibold text-white'>{commerceName ? commerceName : 'Clickpy'}</h1>
        {commerceName && (
          <button
            onClick={commerceNameClickedHandler}
            className='bg-[rgba(255,255,255,0.2)] flex items-center gap-1 backdrop-blur-md py-1 px-2 rounded-lg text-sm text-white'
          >
            Ver sitio
            <ExternalLink height={16} color='white' />
          </button>
        )}
      </div>

      <div className='bg-[rgba(255,255,255,0.2)] flex items-center justify-center backdrop-blur-md rounded-full h-[40px] w-[40px]'>
        <LogOut height={20} color='white' onClick={logoutHandler} />
      </div>
    </header>
  )
})

HeaderAdminClient.displayName = 'HeaderAdminClient'

export default HeaderAdminClient
