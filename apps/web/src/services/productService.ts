import { AdminProduct } from '@/types/AdminProduct'
import instance from '@/utils/axios'

const products = [] as AdminProduct[]

type ProductResponse = {
  success: boolean
  message: string
  products: AdminProduct[]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const getProducts = async (): Promise<ProductResponse> => {
  try {
    const response = await instance.get('/product/getProducts')

    if (response.data.success === false) {
      return { success: false, message: response.data.message, products: [] }
    }

    return { success: true, message: response.data.message, products: response.data.products as AdminProduct[] }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.message, products: [] }
  }
}

const getProduct = async (sk: string): Promise<AdminProduct> => {
  await delay(50)
  return products.find(product => product.sk === sk)!
}

const addProduct = async (product: AdminProduct): Promise<AdminProduct | undefined> => {
  try {
    const response = await instance.post('/product/addProduct', product)
    return response.data.product as AdminProduct
  } catch (error) {
    console.log(error)
  }
}

const duplicateProduct = async (product: AdminProduct): Promise<AdminProduct | undefined> => {
  try {
    const response = await instance.post('/product/duplicateProduct', product)
    return response.data.product as AdminProduct
  } catch (error) {
    console.log(error)
  }
}

const updateProduct = async (product: AdminProduct): Promise<AdminProduct | undefined> => {
  const { pk, ...productWithoutPk } = product
  try {
    const response = await instance.put(`/product/updateProduct`, productWithoutPk)

    if (response.data.error) {
      console.log(response.data.error)
      return
    }

    return response.data.product as AdminProduct
  } catch (error) {
    console.log(error)
  }
}

const deleteProduct = async (sk: string): Promise<void> => {
  try {
    const response = await instance.delete(`/product/deleteProduct/${sk}`)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

const updateProductsVisibility = async (
  productIds: string[],
  isActive: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await instance.put('/product/update-products-visibility', {
      productIds,
      isActive
    })

    return { success: true, message: response.data.message || 'Visibilidad actualizada correctamente' }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.response?.data?.message || 'Error al actualizar visibilidad' }
  }
}

const updateProductsHiddenStatus = async (
  productIds: string[],
  isHidden: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await instance.put('/product/update-products-visibility', {
      productIds,
      isHidden
    })

    return { success: true, message: response.data.message || 'Estado de visibilidad actualizado correctamente' }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.response?.data?.message || 'Error al actualizar estado de visibilidad' }
  }
}

const updateCategoryName = async (
  productSks: string[],
  newCategoryName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await instance.put('/product/update-products-category', {
      productSks,
      newCategoryName
    })

    return { success: true, message: response.data.message || 'Nombre de categoría actualizado correctamente' }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.response?.data?.message || 'Error al actualizar el nombre de la categoría' }
  }
}

// PUBLIC

const getPublicProducts = async (commercePk: string): Promise<ProductResponse> => {
  try {
    const response = await instance.get(`/public/product/commerce-products/${commercePk}`)

    if (response.data.success === false) {
      return { success: false, message: response.data.message, products: [] }
    }

    return { success: true, message: response.data.message, products: response.data.products as AdminProduct[] }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.message, products: [] }
  }
}

const productService = {
  getProducts,
  getProduct,
  addProduct,
  duplicateProduct,
  updateProduct,
  deleteProduct,
  updateProductsVisibility,
  updateProductsHiddenStatus,
  getPublicProducts,
  updateCategoryName
}

export default productService
