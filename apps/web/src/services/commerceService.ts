import instance from '@/utils/axios'

// Cached main branch ID — set when getCommerce() is called, reused for updates
let mainBranchId: string | null = null

export const getMainBranchId = () => mainBranchId

// Store field name → org column name
const ORG_FIELD_MAP: Record<string, string> = {
  commerceName: 'name',
  commerceLogo: 'logo',
  commerceBanner: 'banner',
  commercePhone: 'phone',
  commerceSlug: 'slug',
  commercePrimaryColor: 'primary_color',
}

// Store field name → branch column name
const BRANCH_FIELD_MAP: Record<string, string> = {
  commerceSchedule: 'schedule',
  askPaymentMethod: 'ask_payment_method',
}

export const getCommerce = async () => {
  try {
    const [orgRes, branchRes] = await Promise.all([
      instance.get('/organization'),
      instance.get('/branch'),
    ])

    const org = orgRes.data.organization
    const branches: any[] = branchRes.data.branches ?? []
    const main = branches.find((b) => b.is_main) ?? branches[0]
    mainBranchId = main?.id ?? null

    const pm = main?.payment_methods ?? {}
    const sm = main?.shipping_methods ?? {}

    return {
      commerceInfo: {
        commerceName: org.name ?? '',
        commerceLogo: org.logo ?? '',
        commerceBanner: org.banner ?? '',
        commercePhone: org.phone ?? '',
        commerceSlug: org.slug ?? '',
        commercePrimaryColor: org.primary_color ?? '',
        commerceInstagram: '',
        commerceFacebook: '',
        commerceTiktok: '',
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
      },
    }
  } catch (error) {
    console.log(error)
  }
}

export async function putCommerce(body: Record<string, any>) {
  try {
    const orgData: Record<string, any> = {}
    const branchData: Record<string, any> = {}

    for (const [key, value] of Object.entries(body)) {
      if (ORG_FIELD_MAP[key]) orgData[ORG_FIELD_MAP[key]] = value
      else if (BRANCH_FIELD_MAP[key]) branchData[BRANCH_FIELD_MAP[key]] = value
    }

    let orgResponse: any = null
    let branchResponse: any = null

    if (Object.keys(orgData).length > 0) {
      const res = await instance.put('/organization', orgData)
      orgResponse = res.data.organization
    }

    if (Object.keys(branchData).length > 0 && mainBranchId) {
      const res = await instance.put(`/branch/${mainBranchId}`, branchData)
      branchResponse = res.data.branch
    }

    const commerceInfo: Record<string, any> = {}
    if (orgResponse) {
      commerceInfo.commerceName = orgResponse.name
      commerceInfo.commerceLogo = orgResponse.logo
      commerceInfo.commerceBanner = orgResponse.banner
      commerceInfo.commercePhone = orgResponse.phone
      commerceInfo.commerceSlug = orgResponse.slug
      commerceInfo.commercePrimaryColor = orgResponse.primary_color
    }
    if (branchResponse) {
      commerceInfo.commerceSchedule = branchResponse.schedule
      commerceInfo.askPaymentMethod = branchResponse.ask_payment_method
    }

    return { success: true, commerceInfo }
  } catch (error) {
    console.log(error)
    return { success: false, error: 'Error al guardar' }
  }
}

export async function updateCheckoutConfiguration(body: {
  paymentMethods: { cash: boolean; qr: boolean; transfer: boolean; paymentLink: boolean }
  shippingMethods: { pickup: boolean; delivery: boolean; dinein: boolean }
}) {
  try {
    if (!mainBranchId) throw new Error('Branch not loaded')

    const payment_methods = {
      cash: { enabled: body.paymentMethods.cash },
      qr: { enabled: body.paymentMethods.qr },
      transfer: { enabled: body.paymentMethods.transfer },
      paymentLink: { enabled: body.paymentMethods.paymentLink },
    }
    const shipping_methods = {
      pickup: { enabled: body.shippingMethods.pickup },
      delivery: { enabled: body.shippingMethods.delivery, fee: 0 },
      dinein: { enabled: body.shippingMethods.dinein },
    }

    const res = await instance.put(`/branch/${mainBranchId}`, {
      payment_methods,
      shipping_methods,
    })
    return { success: true, branch: res.data.branch }
  } catch (error) {
    console.log(error)
    return { success: false, error: 'Error al actualizar' }
  }
}
