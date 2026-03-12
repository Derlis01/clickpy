'use client'

import { Commerce, Product } from '@/types/PublicCommerceDataResponse'
import { Search, Info, MapPin, Facebook, Instagram } from 'react-feather'
import ProductSection from './ProductSection'
import { useEffect } from 'react'
import tinycolor from 'tinycolor2'
import usePublicCommerceStore from '@/store/publicCommerce'
import { Divider, Skeleton } from '@heroui/react'
import PublicProductCardSkeleton from './skeletons/PublicProductCardSkeleton'
import CommerceScheduleModal from './CommerceInfoModal'
interface HeaderAndLogoProps {
  commerceData: Commerce
}

export default function CommerceProducts({ commerceData }: HeaderAndLogoProps) {
  const setCommerce = usePublicCommerceStore(state => state.setCommerce)
  const setProducts = usePublicCommerceStore(state => state.setProducts)
  const commerceProducts = usePublicCommerceStore(state => state.products)
  const commerceSchedule = usePublicCommerceStore(state => state.commerce?.commerceSchedule)
  const isLoading = usePublicCommerceStore(state => state.isLoading)
  const setPrimaryColorLight = usePublicCommerceStore(state => state.setIsPrimaryColorLight)
  const getPublicProducts = usePublicCommerceStore(state => state.getPublicProducts)

  useEffect(() => {
    const fetchProducts = async () => {
      setCommerce(commerceData)
      const commerceProducts = await getPublicProducts(commerceData.commerceSlug)
      setProducts(commerceProducts.products || [])
      const isLight = tinycolor(commerceData?.commercePrimaryColor).isLight()

      setPrimaryColorLight(isLight)
    }

    fetchProducts()
  }, [commerceData, getPublicProducts, setCommerce, setProducts, setPrimaryColorLight])

  return (
    <>
      <div className='relative z-10'>
        <div className='bg-[#F9F7F4] min-h-screen rounded-t-2xl mt-[-13px] border border-gray-200'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-end gap-5 py-3 md:py-5'>
              <div className='flex gap-3'>
                {commerceData?.commerceInstagram && (
                  <a href={commerceData.commerceInstagram} target='_blank'>
                    <Instagram size={28} />
                  </a>
                )}
                {commerceData?.commerceFacebook && (
                  <a href={commerceData.commerceFacebook} target='_blank'>
                    <Facebook size={28} />
                  </a>
                )}
              </div>
              <CommerceScheduleModal />
            </div>
            {isLoading ? (
              <div>
                <div className='mt-6 mb-14'>
                  <Skeleton className='h-7 mb-2 w-3/5 rounded-lg' />
                  <Skeleton className='h-4 w-3/5 rounded-lg' />
                </div>
                <PublicProductCardSkeleton />
              </div>
            ) : (
              <>
                <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-1 pl-1 mt-5 pb-8 mb-4 border-b-1'>
                  <div>
                    <h2 className='font-bold text-2xl md:text-3xl lg:text-4xl'>{commerceData.commerceName}</h2>
                    <div className='flex items-center gap-1 text-gray-600 mt-2'>
                      <MapPin size={20} className='mt-[3px]' />
                      <span>{commerceData.commerceAddress}</span>
                    </div>
                  </div>
                </div>
                <ProductSection commerceProducts={commerceProducts} commerceData={commerceData} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
