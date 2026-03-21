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
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@heroui/react'
import { useEffect, useState, useMemo } from 'react'
import { Skeleton } from '@heroui/react'
import { Eye, EyeOff, Plus, Edit3, MoreHorizontal } from 'react-feather'

const GripIcon = ({ size = 16, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox='0 0 16 16' fill='currentColor' className={className}>
    <circle cx='5' cy='3' r='1.5' />
    <circle cx='11' cy='3' r='1.5' />
    <circle cx='5' cy='8' r='1.5' />
    <circle cx='11' cy='8' r='1.5' />
    <circle cx='5' cy='13' r='1.5' />
    <circle cx='11' cy='13' r='1.5' />
  </svg>
)
import { toast } from 'sonner'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface CategoryGroup {
  categoryId: string
  categoryName: string
  categorySortOrder: number
  products: AdminProduct[]
}

export default function Home() {
  const products = useProductStore(state => state.products)
  const calculateCategories = useProductStore(state => state.calculateCategories)
  const isLoading = useProductStore(state => state.isLoading)
  const updateProductsHiddenStatus = useProductStore(state => state.updateProductsHiddenStatus)
  const reorderProducts = useProductStore(state => state.reorderProducts)
  const reorderCategories = useProductStore(state => state.reorderCategories)

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

  // Agrupar productos por categoría y ordenar por sort_order
  const categoryGroups: CategoryGroup[] = useMemo(() => {
    const groups: { [key: string]: CategoryGroup } = {}

    products.forEach(product => {
      const key = product.categoryId || 'uncategorized'
      if (!groups[key]) {
        groups[key] = {
          categoryId: product.categoryId || 'uncategorized',
          categoryName: product.category || 'Sin categoría',
          categorySortOrder: product.categorySortOrder,
          products: []
        }
      }
      groups[key].products.push(product)
    })

    // Ordenar categorías por sort_order
    const sorted = Object.values(groups).sort((a, b) => a.categorySortOrder - b.categorySortOrder)

    // Ordenar productos dentro de cada categoría por sort_order
    sorted.forEach(group => {
      group.products.sort((a, b) => a.sortOrder - b.sortOrder)
    })

    return sorted
  }, [products])

  const handleCategoryDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) return

    const reordered = [...categoryGroups]
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)

    const items: { id: string; sort_order: number }[] = []
    reordered.forEach((group, index) => {
      if (group.categoryId !== 'uncategorized') {
        items.push({ id: group.categoryId, sort_order: index })
      }
    })

    if (items.length === 0) return
    const success = await reorderCategories(items)
    if (!success) {
      toast.error('Error al reordenar categorías', { duration: 4000 })
    }
  }

  const handleProductDragEnd = async (result: DropResult, categoryProducts: AdminProduct[]) => {
    if (!result.destination || result.source.index === result.destination.index) return

    const reordered = [...categoryProducts]
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)

    const items = reordered.map((product, index) => ({
      id: product.id,
      sort_order: index
    }))

    const success = await reorderProducts(items)
    if (!success) {
      toast.error('Error al reordenar productos', { duration: 4000 })
    }
  }

  const handleCategoryVisibilityToggle = async (category: string, categoryProducts: AdminProduct[]) => {
    setCategoryVisibilityLoading(prev => ({ ...prev, [category]: true }))
    setOpenPopovers(prev => ({ ...prev, [category]: false }))

    const productIds = categoryProducts.map(product => product.id)

    if (productIds.length === 0) {
      toast.warning('No hay productos en esta categoría para ocultar/mostrar', { duration: 4000 })
      setCategoryVisibilityLoading(prev => ({ ...prev, [category]: false }))
      return
    }

    const allHidden = categoryProducts.every(product => product.isHidden)
    const newHiddenStatus = !allHidden

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
    setOpenPopovers(prev => ({ ...prev, [category]: false }))
  }

  const Loading = ({ count = 8 }) => {
    return (
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className='rounded-xl overflow-hidden'>
            <Skeleton className='w-full aspect-square rounded-t-xl' />
            <div className='p-3 space-y-2'>
              <Skeleton className='h-4 w-4/5 rounded-lg' />
              <Skeleton className='h-3 w-2/5 rounded-lg' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto'>
      {isLoading ? (
        <Loading />
      ) : products.length === 0 ? (
        <ProductEmptyState />
      ) : (
        <div className='px-3'>
          <AddProductButton />

          <DragDropContext onDragEnd={handleCategoryDragEnd}>
            <Droppable droppableId='categories' type='CATEGORY'>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {categoryGroups.map((group, index) => (
                    <Draggable key={group.categoryId} draggableId={group.categoryId} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`mb-2 ${dragSnapshot.isDragging ? 'opacity-90 shadow-lg rounded-lg bg-white' : ''}`}
                        >
                          <Accordion selectionMode='multiple' defaultExpandedKeys={['content']}>
                            <AccordionItem
                              key='content'
                              aria-label={group.categoryName}
                              title={
                                <div className='flex items-center justify-between w-full'>
                                  <div className='flex items-center'>
                                    {/* Drag handle para categoría */}
                                    <div
                                      {...dragProvided.dragHandleProps}
                                      className='p-1 mr-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 rounded transition-colors'
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <GripIcon size={16} className='text-gray-400' />
                                    </div>
                                    <span>{group.categoryName}</span>
                                    <div className='flex items-center justify-center bg-gray-200 w-6 h-6 mt-[2px] rounded-full ml-3'>
                                      <span className='text-sm'>{group.products.length}</span>
                                    </div>
                                  </div>
                                  <div className='flex items-center mr-2'>
                                    <Popover
                                      placement='bottom-end'
                                      isOpen={openPopovers[group.categoryName] || false}
                                      onOpenChange={open => setOpenPopovers(prev => ({ ...prev, [group.categoryName]: open }))}
                                    >
                                      <PopoverTrigger>
                                        <div
                                          role='button'
                                          tabIndex={0}
                                          onClick={e => e.stopPropagation()}
                                          onKeyDown={e => e.key === 'Enter' && e.stopPropagation()}
                                          className='p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer'
                                        >
                                          <MoreHorizontal size={18} className='text-gray-500 hover:text-gray-700' />
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className='p-1 min-w-[200px]'>
                                        <div className='flex flex-col gap-1'>
                                          <button
                                            onClick={e => {
                                              e.stopPropagation()
                                              handleEditCategory(group.categoryName, group.products)
                                            }}
                                            className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left'
                                          >
                                            <Edit3 size={16} />
                                            Editar nombre
                                          </button>

                                          <button
                                            onClick={e => {
                                              e.stopPropagation()
                                              handleCategoryVisibilityToggle(group.categoryName, group.products)
                                            }}
                                            disabled={categoryVisibilityLoading[group.categoryName]}
                                            className='flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors w-full text-left disabled:opacity-50'
                                          >
                                            {categoryVisibilityLoading[group.categoryName] ? (
                                              <Spinner size='sm' />
                                            ) : (
                                              (() => {
                                                const allHidden =
                                                  group.products.length > 0 && group.products.every(p => p.isHidden)
                                                return allHidden ? <Eye size={16} /> : <EyeOff size={16} />
                                              })()
                                            )}
                                            {(() => {
                                              const allHidden =
                                                group.products.length > 0 && group.products.every(p => p.isHidden)
                                              return allHidden ? 'Mostrar categoría' : 'Ocultar categoría'
                                            })()}
                                          </button>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              }
                            >
                              {/* Grid de productos con drag & drop */}
                              <DragDropContext onDragEnd={(result) => handleProductDragEnd(result, group.products)}>
                                <Droppable droppableId={`products-${group.categoryId}`} type='PRODUCT' direction='horizontal'>
                                  {(prodProvided) => (
                                    <div
                                      ref={prodProvided.innerRef}
                                      {...prodProvided.droppableProps}
                                      className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-4'
                                    >
                                      {group.products.map((product, prodIndex) => (
                                        <Draggable key={product.id} draggableId={product.id} index={prodIndex}>
                                          {(prodDragProvided, prodDragSnapshot) => (
                                            <div
                                              ref={prodDragProvided.innerRef}
                                              {...prodDragProvided.draggableProps}
                                              {...prodDragProvided.dragHandleProps}
                                              className={prodDragSnapshot.isDragging ? 'opacity-90 shadow-lg z-50' : ''}
                                            >
                                              <ProductCardAdmin product={product} />
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {prodProvided.placeholder}

                                      {/* Card para agregar producto */}
                                      <div
                                        onClick={() => handleAddProductInCategory(group.categoryName)}
                                        className='flex flex-col items-center justify-center h-full min-h-[200px] bg-white rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group/add'
                                      >
                                        <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover/add:bg-primary/10 transition-colors'>
                                          <Plus size={24} className='text-gray-400 group-hover/add:text-primary transition-colors' />
                                        </div>
                                        <span className='text-sm text-gray-400 mt-3 group-hover/add:text-primary transition-colors'>Agregar producto</span>
                                      </div>
                                    </div>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
