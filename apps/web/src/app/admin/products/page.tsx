'use client'

import { AdminProduct } from '@/types/AdminProduct'
import AddProductButton from './components/AddProducButton'
import ProductCardAdmin from './components/ProductCardAdmin'
import ProductEmptyState from './components/ProductsEmptyState'
import AddProductModal from './components/modals/AddProductModal'
import EditCategoryModal from './components/modals/EditCategoryModal'
import useProductStore from '@/store/productStore'
import {
  Accordion,
  AccordionItem,
  Spinner,
  Tooltip,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure
} from '@heroui/react'
import { useEffect, useState } from 'react'
import { Skeleton } from '@heroui/react'
import { Eye, EyeOff, Plus, Edit3, MoreHorizontal, Settings } from 'react-feather'
import { toast } from 'sonner'

// Function to detect if a string starts with an emoji
const startsWithEmoji = (str: string): boolean => {
  // Simple check for common emoji ranges
  const firstChar = str.trim().charAt(0)
  const codePoint = firstChar.codePointAt(0)

  if (!codePoint) return false

  // Check common emoji ranges
  return (
    (codePoint >= 0x1f600 && codePoint <= 0x1f64f) || // Emoticons
    (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) || // Misc Symbols
    (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) || // Transport
    (codePoint >= 0x1f1e0 && codePoint <= 0x1f1ff) || // Flags
    (codePoint >= 0x2600 && codePoint <= 0x26ff) || // Misc symbols
    (codePoint >= 0x2700 && codePoint <= 0x27bf) || // Dingbats
    (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) // Supplemental Symbols
  )
}

export default function Home() {
  const products = useProductStore(state => state.products)
  const fetchProducts = useProductStore(state => state.fetchProducts)
  const calculateCategories = useProductStore(state => state.calculateCategories)
  const isLoading = useProductStore(state => state.isLoading)
  const updateProductsHiddenStatus = useProductStore(state => state.updateProductsHiddenStatus)

  const [categoryVisibilityLoading, setCategoryVisibilityLoading] = useState<{ [key: string]: boolean }>({})
  const [addProductModalOpen, setAddProductModalOpen] = useState(false)
  const [selectedCategoryForNewProduct, setSelectedCategoryForNewProduct] = useState<string>('')
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false)
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<string>('')
  const [selectedCategoryProducts, setSelectedCategoryProducts] = useState<AdminProduct[]>([])
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    calculateCategories(products)
  }, [products, calculateCategories])

  const productsByCategory = products.reduce((acc: { [key: string]: AdminProduct[] }, product: AdminProduct) => {
    ;(acc[product.category] = acc[product.category] || []).push(product)
    return acc
  }, {})

  // Sort categories: emoji categories first, then alphabetical
  const sortedProductsByCategory = Object.entries(productsByCategory)
    .sort(([categoryA], [categoryB]) => {
      const aStartsWithEmoji = startsWithEmoji(categoryA)
      const bStartsWithEmoji = startsWithEmoji(categoryB)

      if (aStartsWithEmoji && !bStartsWithEmoji) return -1
      if (!aStartsWithEmoji && bStartsWithEmoji) return 1

      return categoryA.localeCompare(categoryB)
    })
    .reduce((acc: { [key: string]: AdminProduct[] }, [category, products]) => {
      acc[category] = products
      return acc
    }, {})

  const handleCategoryVisibilityToggle = async (category: string, categoryProducts: AdminProduct[]) => {
    setCategoryVisibilityLoading(prev => ({ ...prev, [category]: true }))
    // Cerrar el popover cuando se ejecuta la acción
    setOpenPopovers(prev => ({ ...prev, [category]: false }))

    // Solo considerar productos activos
    const activeProducts = categoryProducts.filter(product => product.isActive)
    const productIds = activeProducts.map(product => product.sk)

    if (productIds.length === 0) {
      toast.warning('No hay productos activos en esta categoría para ocultar/mostrar', { duration: 4000 })
      setCategoryVisibilityLoading(prev => ({ ...prev, [category]: false }))
      return
    }

    const allActiveHidden = activeProducts.every(product => product.isHidden)
    const newHiddenStatus = !allActiveHidden

    const success = await updateProductsHiddenStatus(productIds, newHiddenStatus)

    if (success) {
      toast.success(
        newHiddenStatus
          ? `Categoría "${category}" ocultada del catálogo`
          : `Categoría "${category}" mostrada en el catálogo`,
        { duration: 4000 }
      )
    } else {
      toast.error('Error al actualizar la visibilidad de la categoría', { duration: 4000 })
    }

    setCategoryVisibilityLoading(prev => ({ ...prev, [category]: false }))
  }

  const handleAddProductInCategory = (category: string) => {
    setSelectedCategoryForNewProduct(category)
    setAddProductModalOpen(true)
  }

  const handleEditCategory = (category: string, products: AdminProduct[]) => {
    setSelectedCategoryForEdit(category)
    setSelectedCategoryProducts(products)
    setEditCategoryModalOpen(true)
    // Cerrar el popover cuando se abre el modal
    setOpenPopovers(prev => ({ ...prev, [category]: false }))
  }

  const Loading = ({ count = 4 }) => {
    return (
      <div>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className='w-full flex items-center px-4 pt-5 gap-3'>
            <div>
              <Skeleton className='flex rounded-md w-12 h-12' />
            </div>
            <div className='w-full flex flex-col gap-3'>
              <Skeleton className='h-3 w-5/6 rounded-lg' />
              <Skeleton className='h-3 w-3/6 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='max-w-[900px] mx-auto'>
      {isLoading ? (
        <Loading />
      ) : products.length === 0 ? (
        <ProductEmptyState />
      ) : (
        <div className='px-3'>
          <AddProductButton />
          <Accordion selectionMode='multiple' defaultExpandedKeys={['0', '1', '2']}>
            {Object.entries(sortedProductsByCategory).map(([category, products], index) => (
              <AccordionItem
                key={index}
                aria-label={category}
                title={
                  <div className='flex items-center justify-between w-full'>
                    <div className='flex items-center'>
                      <span>{category}</span>
                      <div className='flex items-center justify-center bg-gray-200 w-6 h-6 mt-[2px] rounded-full ml-3'>
                        <span className='text-sm'>{products.length}</span>
                      </div>
                    </div>
                    <div className='flex items-center mr-2'>
                      <Popover
                        placement='bottom-end'
                        isOpen={openPopovers[category] || false}
                        onOpenChange={open => setOpenPopovers(prev => ({ ...prev, [category]: open }))}
                      >
                        <PopoverTrigger>
                          <button
                            onClick={e => e.stopPropagation()}
                            className='p-1.5 hover:bg-gray-100 rounded-full transition-colors'
                          >
                            <MoreHorizontal size={18} className='text-gray-500 hover:text-gray-700' />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className='p-1 min-w-[200px]'>
                          <div className='flex flex-col gap-1'>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleEditCategory(category, products)
                              }}
                              className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left'
                            >
                              <Edit3 size={16} />
                              Editar nombre
                            </button>

                            <button
                              onClick={e => {
                                e.stopPropagation()
                                handleCategoryVisibilityToggle(category, products)
                              }}
                              disabled={categoryVisibilityLoading[category]}
                              className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left disabled:opacity-50'
                            >
                              {categoryVisibilityLoading[category] ? (
                                <Spinner size='sm' />
                              ) : (
                                (() => {
                                  const activeProducts = products.filter(product => product.isActive)
                                  const allActiveHidden =
                                    activeProducts.length > 0 && activeProducts.every(product => product.isHidden)
                                  return allActiveHidden ? <Eye size={16} /> : <EyeOff size={16} />
                                })()
                              )}
                              {(() => {
                                const activeProducts = products.filter(product => product.isActive)
                                const allActiveHidden =
                                  activeProducts.length > 0 && activeProducts.every(product => product.isHidden)
                                return allActiveHidden ? 'Mostrar categoría' : 'Ocultar categoría'
                              })()}
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                }
              >
                {products.map(product => (
                  <ProductCardAdmin key={product.sk} product={product} />
                ))}

                {/* Botón para agregar producto en esta categoría */}
                <div className='mt-4 mb-2'>
                  <Button
                    variant='light'
                    size='sm'
                    onPress={() => handleAddProductInCategory(category)}
                    className='w-full h-10 text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 transition-colors'
                    startContent={<Plus size={16} />}
                  >
                    Agregar producto
                  </Button>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}

      {/* Modal para agregar producto con categoría preseleccionada */}
      <AddProductModal
        isOpen={addProductModalOpen}
        onOpenChange={open => {
          setAddProductModalOpen(open)
          if (!open) {
            setSelectedCategoryForNewProduct('')
          }
        }}
        editMode={false}
        preselectedCategory={selectedCategoryForNewProduct}
      />

      {/* Modal para editar categoría */}
      <EditCategoryModal
        isOpen={editCategoryModalOpen}
        onOpenChange={open => {
          setEditCategoryModalOpen(open)
          if (!open) {
            setSelectedCategoryForEdit('')
            setSelectedCategoryProducts([])
          }
        }}
        categoryName={selectedCategoryForEdit}
        products={selectedCategoryProducts}
      />
    </div>
  )
}
