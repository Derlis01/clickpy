import { Table } from '@clickpy/shared'
import instance from '@/utils/axios'

type TableResponse = {
  success: boolean
  message: string
  tables: Table[]
}

const getTables = async (): Promise<TableResponse> => {
  try {
    const response = await instance.get('/table')
    return { success: true, message: '', tables: response.data ?? [] }
  } catch (error: any) {
    console.log(error)
    return { success: false, message: error.message, tables: [] }
  }
}

const createTable = async (data: { name: string; number: number }): Promise<Table | undefined> => {
  try {
    const response = await instance.post('/table', data)
    return response.data
  } catch (error) {
    console.log(error)
  }
}

const deleteTable = async (id: string): Promise<void> => {
  try {
    await instance.delete(`/table/${id}`)
  } catch (error) {
    console.log(error)
  }
}

const tableService = {
  getTables,
  createTable,
  deleteTable
}

export default tableService
