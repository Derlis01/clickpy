import { Schedule } from '@/types/commerceModel'

export const initialCommerceSchedule = [
  {
    active: false,
    dayNumber: 0,
    day: 'Domingo',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  },
  {
    active: false,
    dayNumber: 1,
    day: 'Lunes',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  },
  {
    active: false,
    dayNumber: 2,
    day: 'Martes',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  },
  {
    active: false,
    dayNumber: 3,
    day: 'Miércoles',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  },
  {
    active: false,
    dayNumber: 4,
    day: 'Jueves',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  },
  {
    active: false,
    dayNumber: 5,
    day: 'Viernes',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  },
  {
    active: false,
    dayNumber: 6,
    day: 'Sábado',
    hours: [{ initUtcDate: '2021-09-26T13:00:00.000Z', endUtcDate: '2021-09-26T21:00:00.000Z' }]
  }
] as Schedule[]
