import CommerceProducts from './components/CommerceProducts'
import Footer from './components/Footer'
import HeaderAndLogo from './components/HeaderAndLogo'
import type { Metadata, ResolvingMetadata } from 'next'

const fetchCommerceData = async (slug: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/public/commerce/get-commerce-info/${slug}`, {
    cache: 'no-store'
  })
  const data = await response.json()
  return data
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  // read route params
  const slug = params.slug

  // fetch data
  const commerceData = await fetchCommerceData(slug)

  return {
    title: `${commerceData.commerceInfo.commerceName} | Inicio`,
    description: commerceData.commerceInfo.commerceAddress,
    keywords: ['Ecommerce', 'Comercio', 'Productos', 'Tienda', 'Online', 'Venta', 'Compras', 'Negocio'],
    openGraph: {
      title: commerceData.commerceInfo.commerceName,
      description: commerceData.commerceInfo.commerceAddress,
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${slug}`,
      images: [
        {
          url: commerceData.commerceInfo.commerceLogo,
          alt: `Logo de ${commerceData.commerceInfo.commerceName}`
        }
      ],
      locale: 'es_ES',
      type: 'website'
    },
    icons: {
      icon: `${commerceData.commerceInfo.commerceLogo}`
    }
  }
}

export async function generateViewport({ params }: { params: { slug: string } }) {
  // read route params
  const slug = params.slug

  const commerceData = await fetchCommerceData(slug)

  return {
    themeColor: `#${commerceData?.commerceInfo?.commercePrimaryColor}`
  }
}

export default async function CommerceClient({ params }: { params: { slug: string } }) {
  const commerceResponse = await fetchCommerceData(params.slug)
  const commerce = commerceResponse.commerceInfo
  return (
    <div className='relative'>
      <HeaderAndLogo commerceData={commerce} />
      <CommerceProducts commerceData={commerce} />
      <Footer />
    </div>
  )
}
