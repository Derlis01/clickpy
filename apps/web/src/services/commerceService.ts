import instance from '@/utils/axios'
import { CommerceInsightsResponse, CommerceModel } from '@/types/commerceModel'
import { JobStatusResponse } from '@/types/JobStatus'

export const getCommerce = async () => {
  try {
    const response = await instance.get('/commerce/get-commerce-info')
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export const getCommerceInsights = async () => {
  try {
    const response = await instance.get('/commerce/get-commerce-insights')
    return response.data.insights as CommerceInsightsResponse[]
  } catch (error) {
    console.log(error)
  }
}

export const generateInsights = async () => {
  try {
    const response = await instance.post('/commerce/generate-insights')
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function putCommerce(body: Partial<CommerceModel>) {
  try {
    const response = await instance.put('/commerce/put-commerce-info', body)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

export async function updateCheckoutConfiguration(body: {
  paymentMethods: {
    cash: boolean
    qr: boolean
    transfer: boolean
    paymentLink: boolean
  }
  shippingMethods: {
    pickup: boolean
    delivery: boolean
    dinein: boolean
  }
}) {
  try {
    const response = await instance.put('/commerce/update-checkout-configuration', body)
    return response.data
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  try {
    const response = await instance.get(`/commerce/jobs/${jobId}`)
    return response.data
  } catch (error) {
    console.log('Error getting job status:', error)
    throw error
  }
}

export async function pollJobStatus(jobId: string, intervalMs = 30000, maxAttempts = 20): Promise<JobStatusResponse> {
  return new Promise((resolve, reject) => {
    let attempts = 0

    const poll = async () => {
      attempts++

      try {
        const status = await getJobStatus(jobId)

        if (status.status === 'done') {
          resolve(status)
          return
        }

        if (status.status === 'failed') {
          reject(new Error(status.error || 'Job failed'))
          return
        }

        if (attempts >= maxAttempts) {
          reject(new Error('Polling timeout: job did not complete in time'))
          return
        }

        // Solo continúa haciendo polling si el estado es 'pending', 'processing' o 'running'
        if (status.status === 'pending' || status.status === 'processing' || status.status === 'running') {
          setTimeout(poll, intervalMs)
        } else {
          reject(new Error(`Unknown job status: ${status.status}`))
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(error)
          return
        }
        // Reintenta en caso de error de red
        setTimeout(poll, intervalMs)
      }
    }

    poll()
  })
}
