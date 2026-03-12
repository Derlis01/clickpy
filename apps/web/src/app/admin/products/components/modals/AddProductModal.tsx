'use client'

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody
} from '@heroui/react'
import { useEffect, useState, useRef } from 'react'
import { AdminProduct } from '@/types/AdminProduct'
import ProductImageForm from '../ProductImageForm'
import ProducDataForm from '../ProductDataForm'
import ProductCategoryForm from '../ProductCategoryForm'
import ProductAdvancedForm from '../ProductAdvancedForm'
import useProductStore from '@/store/productStore'
import { toast } from 'sonner'
import { useWindowSize } from '@/hooks/useWindowSize'
import { useRouter } from 'next/navigation'

interface AddProductModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  productToEdit?: AdminProduct | null
  editMode?: boolean
  preselectedCategory?: string
}

const ProductModal: React.FC<AddProductModalProps> = ({ isOpen, onOpenChange, editMode, preselectedCategory }) => {
  const router = useRouter()
  const addProduct = useProductStore(state => state.addProduct)
  const updateProduct = useProductStore(state => state.updateProduct)
  const productInfoToEdit = useProductStore(state => state.product)
  const productToEdit = useProductStore(state => state.product)
  const setActualProduct = useProductStore(state => state.setActualProduct)
  const [isFormValid, setIsFormValid] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const hasSetPreselectedCategory = useRef(false)
  const [productForm, setProductForm] = useState({
    id: '',
    imageUrl: '',
    productName: '',
    price: 0,
    description: '',
    isHidden: false,
    category: '',
    productOptions: [],
    isActive: true,
    aggregates: [],
    hasAddonLimits: false
  } as AdminProduct)

  const isDesktop = useWindowSize()

  const validateForm = () => {
    const isValid = productForm.productName !== '' && productForm.price > 0 && productForm.category !== ''
    setIsFormValid(isValid)
    return isValid
  }

  // this useEffect is used to reset the form when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      const emptyProduct = {
        id: '',
        imageUrl: '',
        productName: '',
        price: 0,
        description: '',
        isHidden: false,
        category: preselectedCategory || '',
        isActive: true,
        productOptions: [],
        aggregates: [],
        hasAddonLimits: false,
        options: [],
        addons: []
      } as AdminProduct
      setIsFormValid(true)
      setProductForm(emptyProduct)
      // Initialize store state with empty product
      setActualProduct(emptyProduct)
      hasSetPreselectedCategory.current = false
    }
  }, [isOpen, preselectedCategory, setActualProduct])

  // this useEffect is used to set the product to edit in the form
  useEffect(() => {
    if (editMode && productInfoToEdit) {
      setProductForm(productInfoToEdit)
    } else if (isOpen && !editMode && preselectedCategory && !hasSetPreselectedCategory.current) {
      hasSetPreselectedCategory.current = true
      setProductForm(prevForm => ({
        ...prevForm,
        category: preselectedCategory
      }))
    }
  }, [productInfoToEdit, editMode, isOpen, preselectedCategory])

  const setProductFormWithLog = (newForm: AdminProduct) => {
    setProductForm(newForm)
    // Also update the store's product state
    setActualProduct(newForm)
  }

  const submitProductForm = async (closeModal: () => void) => {
    if (validateForm()) {
      setIsLoading(true)
      try {
        const currentProduct = useProductStore.getState().product
        const finalProduct = {
          ...productForm,
          options: currentProduct?.options || [],
          addons: currentProduct?.addons || []
        }

        if (editMode) {
          await updateProduct(finalProduct)
          toast.success('Producto actualizado')
        } else {
          await addProduct(finalProduct)
          toast.success('Producto agregado')
        }
        closeModal()
      } catch (error) {
        toast.error('Error al guardar el producto')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleModalChange = (newState: boolean) => {
    onOpenChange(newState)
  }

  const renderContent = (closeModal: () => void) => (
    <>
      <ModalHeader className='flex flex-col gap-1 px-6'>
        {productToEdit ? 'Editar producto' : 'Agregar producto'}
      </ModalHeader>
      <ModalBody className='flex items-center overflow-y-auto scrollbar-hide'>
        <div className='w-full flex flex-col gap-6 px-6 pb-6'>
          <ProductImageForm
            productForm={productForm}
            setProductForm={setProductFormWithLog}
            isFormValid={isFormValid}
          />
          <ProducDataForm productForm={productForm} setProductForm={setProductFormWithLog} isFormValid={isFormValid} />
          <ProductCategoryForm
            productForm={productForm}
            setProductForm={setProductFormWithLog}
            isFormValid={isFormValid}
          />
          <ProductAdvancedForm productForm={productForm} setProductForm={setProductFormWithLog} />
        </div>
      </ModalBody>
      <div className='px-6 py-3 border-t border-gray-200'>
        <Button
          color='primary'
          onPress={() => submitProductForm(closeModal)}
          size='md'
          radius='sm'
          isLoading={isLoading}
          className='w-full'
        >
          {productToEdit ? 'Guardar cambios' : 'Agregar producto'}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {isDesktop ? (
        <Drawer
          isOpen={isOpen}
          onClose={() => handleModalChange(false)}
          placement='right'
          size='lg'
          isDismissable={false}
          classNames={{
            base: 'bg-white',
            header: 'border-b-[1px] border-gray-200',
            body: 'p-0 overflow-y-auto scrollbar-hide',
            closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full right-6'
          }}
        >
          <DrawerContent onClick={e => e.stopPropagation()}>{onClose => renderContent(onClose)}</DrawerContent>
        </Drawer>
      ) : (
        <Modal
          isOpen={isOpen}
          onOpenChange={handleModalChange}
          size='full'
          isDismissable={false} // Esto evita que se cierre al hacer clic fuera
          hideCloseButton={false} // Mantener visible el botón de cerrar
          classNames={{
            base: 'bg-white',
            header: 'border-b-[1px] border-gray-200',
            body: 'p-0 overflow-y-auto scrollbar-hide',
            closeButton: 'hover:bg-gray-100 active:bg-gray-200 rounded-full right-6'
          }}
        >
          <ModalContent onClick={e => e.stopPropagation()}>{onClose => renderContent(onClose)}</ModalContent>
        </Modal>
      )}
    </>
  )
}

export default ProductModal
