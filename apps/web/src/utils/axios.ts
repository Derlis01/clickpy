import axios from 'axios'
import { createClient } from '@/utils/supabase/client'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000000
})

const supabase = createClient()

// Request interceptor: attach Supabase session token
instance.interceptors.request.use(
  async config => {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor: redirect to login on 401
instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default instance
