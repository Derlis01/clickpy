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

export async function generateMetadata({ params }: { params: Promise<{ slug: string; productId: string }> }): Promise<Metadata> {
  const { slug, productId } = await params
  const product = await getProductById(slug, productId)

  return {
    title: product.productName,
    description: product.description,
    openGraph: {
      images: [product.imageUrl]
    }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string; productId: string }> }) {
  const { slug, productId } = await params
  const product = await getProductById(slug, productId)

  return (
    <>
      <ProductModalClient product={product} commerceSlug={slug} />
    </>
  )
}
