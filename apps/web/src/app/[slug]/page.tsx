import CommerceProducts from './components/CommerceProducts'
import Footer from './components/Footer'
import HeaderAndLogo from './components/HeaderAndLogo'
import type { Metadata, ResolvingMetadata } from 'next'
import { cache } from 'react'

const fetchCommerceData = cache(async (slug: string) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL

  const [orgRes, branchesRes] = await Promise.all([
    fetch(`${base}/public/org/${slug}`, { cache: 'no-store' }),
    fetch(`${base}/public/org/${slug}/branches`, { cache: 'no-store' }),
  ])

  if (!orgRes.ok) return null

  const orgData = await orgRes.json()
  const branchesData = branchesRes.ok ? await branchesRes.json() : { branches: [] }

  const org = orgData.organization
  const branches: any[] = branchesData.branches ?? []
  const main = branches.find((b: any) => b.is_main) ?? branches[0]

  const pm = main?.payment_methods ?? {}
  const sm = main?.shipping_methods ?? {}

  const commerceInfo = {
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
    },
  }

  return { commerceInfo }
})

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params

  const commerceData = await fetchCommerceData(slug)

  const info = commerceData?.commerceInfo

  return {
    title: info?.commerceName ? `${info.commerceName} | Inicio` : 'ClickPy',
    description: info?.commerceAddress ?? '',
    keywords: ['Ecommerce', 'Comercio', 'Productos', 'Tienda', 'Online', 'Venta', 'Compras', 'Negocio'],
    openGraph: {
      title: info?.commerceName ?? 'ClickPy',
      description: info?.commerceAddress ?? '',
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${slug}`,
      images: info?.commerceLogo
        ? [{ url: info.commerceLogo, alt: `Logo de ${info.commerceName}` }]
        : [],
      locale: 'es_ES',
      type: 'website'
    },
    icons: {
      icon: info?.commerceLogo ?? undefined
    }
  }
}

export async function generateViewport({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const commerceData = await fetchCommerceData(slug)

  return {
    themeColor: `#${commerceData?.commerceInfo?.commercePrimaryColor}`
  }
}

export default async function CommerceClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const commerceResponse = await fetchCommerceData(slug)
  const commerce = commerceResponse?.commerceInfo

  if (!commerce) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4 text-gray-500'>
        <p className='text-lg font-medium'>Este comercio no existe o aún no está disponible.</p>
      </div>
    )
  }

  return (
    <div className='relative'>
      <HeaderAndLogo commerceData={commerce} />
      <CommerceProducts commerceData={commerce} />
      <Footer />
    </div>
  )
}
