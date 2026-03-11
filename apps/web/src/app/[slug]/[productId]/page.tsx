import { Metadata } from 'next'
import ProductModalClient from '../components/ProductModalClient'

const getProductById = async (commerceSlug: string, productId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/public/product/${commerceSlug}/${productId}`)
    const data = await response.json()
    return data.product
  } catch (error) {
    console.error('Error fetching product:', error)
  }
}

export async function generateMetadata({ params }: { params: { slug: string; productId: string } }): Promise<Metadata> {
  // fetch data
  const product = await getProductById(params.slug, params.productId)

  return {
    title: product.productName,
    description: product.description,
    openGraph: {
      images: [product.imageUrl]
    }
  }
}

export default async function ProductPage({ params }: { params: { slug: string; productId: string } }) {
  const product = await getProductById(params.slug, params.productId)

  return (
    <>
      <ProductModalClient product={product} commerceSlug={params.slug} />
    </>
  )
}
