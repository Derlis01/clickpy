'use client'

import { AdminProduct, ProductAddon, ProductOption } from '@/types/AdminProduct'
import { Accordion, AccordionItem, Button, Card, CardBody, Chip } from '@heroui/react'
import { ChevronRight, Trash } from 'react-feather'
import useProductStore from '@/store/productStore'
import AddOptionModal from './modals/product-option/AddOptionModal'
import EditOptionModal from './modals/product-option/EditOptionModal'
import AddAddonModal from './modals/product-addons/AddAddonModal'
import { AddonLimitsSection } from './modals/product-addons/AddonLimitsSection'
import { thousandsSeparator } from '@/utils/price'
import { useDisclosure } from '@heroui/react'

interface ProductAdvancedFormProps {
  productForm: AdminProduct
  setProductForm: (productForm: AdminProduct) => void
}

export default function ProductAdvancedForm({ productForm, setProductForm }: ProductAdvancedFormProps) {
  const product = useProductStore(state => state.product)
  const updateProductInStore = useProductStore(state => state.setActualProduct)
  const {
    isOpen: isEditOptionModalOpen,
    onOpen: onEditOptionModalOpen,
    onOpenChange: onEditOptionModalOpenChange
  } = useDisclosure()
  const {
    isOpen: isAddOptionModalOpen,
    onOpen: onAddOptionModalOpen,
    onOpenChange: onAddOptionModalOpenChange
  } = useDisclosure()
  const {
    isOpen: isEditAddonModalOpen,
    onOpen: onEditAddonModalOpen,
    onOpenChange: onEditAddonModalOpenChange
  } = useDisclosure()
  const {
    isOpen: isAddAddonModalOpen,
    onOpen: onAddAddonModalOpen,
    onOpenChange: onAddAddonModalOpenChange
  } = useDisclosure()

  const handleSaveOption = (option: ProductOption) => {
    if (!product) return
    const updatedProduct = {
      ...product,
      options: [...(product.options || []), option]
    }
    updateProductInStore(updatedProduct)
    setProductForm({
      ...productForm,
      options: updatedProduct.options
    })
  }

  const handleDeleteOption = (optionId: string) => {
    if (!product) return
    const updatedProduct: AdminProduct = {
      ...product,
      options: product.options?.filter(opt => opt.optionId !== optionId) || []
    }
    updateProductInStore(updatedProduct)
    // Propagar cambios al formulario principal
    setProductForm({
      ...productForm,
      options: updatedProduct.options
    })
  }

  const handleUpdateOption = (updatedOption: ProductOption) => {
    if (!product) return
    const updatedProduct: AdminProduct = {
      ...product,
      options: product.options?.map(opt => (opt.optionId === updatedOption.optionId ? updatedOption : opt)) || []
    }
    updateProductInStore(updatedProduct)
    // Propagar cambios al formulario principal
    setProductForm({
      ...productForm,
      options: updatedProduct.options
    })
  }

  const handleProductUpdate = (updates: Partial<AdminProduct>) => {
    if (!product) return
    const updatedProduct = {
      ...product,
      ...updates
    }
    updateProductInStore(updatedProduct)
    setProductForm({
      ...productForm,
      ...updates
    })
  }

  const handleSaveAddons = (addons: ProductAddon[]) => {
    if (!product) return
    const updatedProduct = {
      ...product,
      addons: addons
    }
    updateProductInStore(updatedProduct)
    setProductForm({
      ...productForm,
      addons: addons
    })
  }

  const renderAddonsSummary = () => {
    if (!product?.addons || product.addons.length === 0) {
      return (
        <Button
          size='md'
          radius='sm'
          className='bg-gray-100 w-full hover:bg-gray-200 text-gray-700'
          onPress={onAddAddonModalOpen}
        >
          Agregar adicional
        </Button>
      )
    }

    return (
      <div className='space-y-4'>
        <Card className='w-full cursor-pointer transition-all' onPress={onEditAddonModalOpen} isPressable>
          <CardBody className='p-4'>
            <div className='flex flex-col gap-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-500'>Adicionales configurados</span>
                <Chip size='sm' variant='flat' className='bg-gray-100'>
                  {product.addons.length}
                </Chip>
              </div>

              <div className='flex flex-wrap gap-2'>
                {product.addons.map(addon => (
                  <Chip
                    key={addon.addonId}
                    variant='flat'
                    className='bg-secondary-50 text-secondary border-secondary-100'
                  >
                    {addon.name} · Gs. {thousandsSeparator(addon.price)}
                  </Chip>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className='w-full bg-gray-50 border border-gray-200'>
          <CardBody className='p-4'>
            <AddonLimitsSection product={product} onUpdate={handleProductUpdate} />
          </CardBody>
        </Card>
      </div>
    )
  }

  const renderOptionsSummary = () => {
    return (
      <div className='space-y-4'>
        {product?.options &&
          product.options.map(option => (
            <Card
              key={option.optionId}
              className='w-full cursor-pointer transition-all'
              onPress={() => {
                updateProductInStore({ ...product, selectedOptionId: option.optionId })
                onEditOptionModalOpen()
              }}
              isPressable
            >
              <CardBody className='p-4'>
                <div className='flex flex-col gap-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-500'>{option.name}</span>
                    <Button isIconOnly size='sm' variant='light' onPress={() => handleDeleteOption(option.optionId)}>
                      <Trash className='w-4 h-4 text-gray-500' />
                    </Button>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {option.values.map(value => (
                      <Chip
                        key={value.optionValueId}
                        variant='flat'
                        className='bg-secondary-50 text-secondary border-secondary-100'
                      >
                        {value.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

        <Button
          size='md'
          radius='sm'
          className='bg-gray-100 w-full hover:bg-gray-200 text-gray-700'
          onPress={onAddOptionModalOpen}
        >
          Agregar opción
        </Button>
      </div>
    )
  }

  return (
    <>
      <Accordion
        defaultExpandedKeys={['0']}
        selectionMode='multiple'
        itemClasses={{
          title: 'text-base font-medium text-gray-800 flex items-center gap-2',
          content: 'px-2'
        }}
        className='px-0 mb-80'
      >
        <AccordionItem
          key='1'
          aria-label='Avanzadas'
          title='Avanzadas'
          indicator={({ isOpen }) => (
            <ChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} size={22} />
          )}
        >
          <div className='space-y-8'>
            {/* Options section */}
            <div className='space-y-4'>
              <h3 className='text-base font-medium text-gray-800'>Opciones del producto</h3>
              {renderOptionsSummary()}
            </div>

            {/* Addons section */}
            <div className='space-y-4'>
              <h3 className='text-base font-medium text-gray-800'>Adicionales del producto</h3>
              {renderAddonsSummary()}
            </div>
          </div>
        </AccordionItem>
      </Accordion>

      <AddOptionModal
        isOpen={isEditOptionModalOpen}
        onOpenChange={onEditOptionModalOpenChange}
        onSave={handleUpdateOption}
        isEdit={true}
      />
      <AddOptionModal
        isOpen={isAddOptionModalOpen}
        onOpenChange={onAddOptionModalOpenChange}
        onSave={handleSaveOption}
      />
      <AddAddonModal
        isOpen={isEditAddonModalOpen}
        onOpenChange={onEditAddonModalOpenChange}
        onSave={handleSaveAddons}
        isEdit={true}
      />
      <AddAddonModal isOpen={isAddAddonModalOpen} onOpenChange={onAddAddonModalOpenChange} onSave={handleSaveAddons} />
    </>
  )
}
