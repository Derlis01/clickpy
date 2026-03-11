export interface JobStatusResponse {
  success: boolean
  jobId: string
  status: 'pending' | 'processing' | 'running' | 'done' | 'failed'
  jobType: string
  result: {
    imageUrl?: string
    [key: string]: any
  } | null
  error: string | null
}

export interface CreateImageJobResponse {
  success: boolean
  jobId: string
  message?: string
}
