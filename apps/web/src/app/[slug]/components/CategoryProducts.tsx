import { Commerce, Product } from '@/types/PublicCommerceDataResponse'
import ProductCard from './ProductCard'

interface CategoryComponentProps {
  categoryName: string
  products: Product[]
  commerce: Commerce
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({ categoryName, products, commerce }) => (
  <div className='mb-15 mt-8 w-full'>
    <h3 className='mb-6 font-semibold text-xl'>{categoryName}</h3>
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {products.map(product => (
        <ProductCard key={product.sk} product={product} commerce={commerce} />
      ))}
    </div>
  </div>
)

export default CategoryComponent
