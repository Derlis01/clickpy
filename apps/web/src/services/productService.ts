import { AdminProduct } from '@/types/AdminProduct'
import instance from '@/utils/axios'

type ProductResponse = {
  success: boolean
  message: string
  products: AdminProduct[]
}

// Maps backend DB record → AdminProduct (used by store/components)
function toAdminProduct(p: any): AdminProduct {
  return {
    id: p.id,
    imageUrl: p.cover_image ?? '',
    productName: p.name,
    price: p.price,
    description: p.description ?? '',
    category: p.product_categories?.name ?? '',
    options: p.options ?? [],
    addons: p.addons ?? [],
    hasAddonLimits: p.has_addon_limits ?? false,
    isActive: p.is_active ?? true,
    isHidden: p.is_hidden ?? false,
    minAddons: p.min_addons ?? undefined,
    maxAddons: p.max_addons ?? undefined,
  }
}

// Maps AdminProduct → backend DTO fields
function toApiProduct(p: AdminProduct): Record<string, any> {
  return {
    name: p.productName,
    price: p.price,
    cover_image: p.imageUrl ?? '',
    description: p.description ?? '',
    options: p.options ?? [],
    addons: p.addons ?? [],
    has_addon_limits: p.hasAddonLimits ?? false,
    min_addons: p.minAddons ?? null,
    max_addons: p.maxAddons ?? null,
  }
}

const getProducts = async (): Promise<ProductResponse> => {
  try {
    const response = await instance.get('/product')
    const products = (response.data.products ?? []).map(toAdminProduct)
    return { success: true, message: response.data.message, products }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.message, products: [] }
  }
}

const getProduct = async (id: string): Promise<AdminProduct> => {
  const response = await instance.get(`/product/${id}`)
  return toAdminProduct(response.data.product)
}

const addProduct = async (product: AdminProduct): Promise<AdminProduct | undefined> => {
  try {
    const response = await instance.post('/product', toApiProduct(product))
    return toAdminProduct(response.data.product)
  } catch (error) {
    console.log(error)
  }
}

const duplicateProduct = async (product: AdminProduct): Promise<AdminProduct | undefined> => {
  try {
    const response = await instance.post('/product/duplicate', toApiProduct(product))
    return toAdminProduct(response.data.product)
  } catch (error) {
    console.log(error)
  }
}

const updateProduct = async (product: AdminProduct): Promise<AdminProduct | undefined> => {
  try {
    const body = { id: product.id, ...toApiProduct(product) }
    const response = await instance.put('/product', body)
    return toAdminProduct(response.data.product)
  } catch (error) {
    console.log(error)
  }
}

const deleteProduct = async (id: string): Promise<void> => {
  try {
    await instance.delete(`/product/${id}`)
  } catch (error) {
    console.log(error)
  }
}

const updateProductsVisibility = async (
  productIds: string[],
  isActive: boolean
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await instance.put('/product/visibility', {
      product_ids: productIds,
      is_hidden: !isActive,
    })
    return { success: true, message: response.data.message || 'Visibilidad actualizada' }
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
    const response = await instance.put('/product/visibility', {
      product_ids: productIds,
      is_hidden: isHidden,
    })
    return { success: true, message: response.data.message || 'Estado de visibilidad actualizado' }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.response?.data?.message || 'Error al actualizar estado' }
  }
}

const getPublicProducts = async (orgSlug: string): Promise<ProductResponse> => {
  try {
    const response = await instance.get(`/public/product/${orgSlug}`)
    const products = (response.data.products ?? []).map(toAdminProduct)
    return { success: true, message: response.data.message, products }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.message, products: [] }
  }
}

// Category management not yet implemented in v2 API
const updateCategoryName = async (
  _productSks: string[],
  _newCategoryName: string
): Promise<{ success: boolean; message: string }> => {
  console.warn('updateCategoryName: not yet implemented in v2 API')
  return { success: false, message: 'Not implemented' }
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
  updateCategoryName,
  getPublicProducts,
}

export default productService
