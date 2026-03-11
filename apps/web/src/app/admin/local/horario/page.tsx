'use client'

import { Switch, TimeInput, TimeInputValue, Button } from '@heroui/react'
import { motion } from 'framer-motion'
import useCommerceStore from '@/store/commerceStore'
import { useDebouncedCallback } from 'use-debounce'
import { toast } from 'sonner'

type hourType = {
  hour: number
  millisecond: number
  minute: number
  second: number
}

const ScheduleRow = ({
  day,
  index,
  onSwitchChange,
  onTimeChange,
  extractHourAndMinute
}: {
  day: any
  index: number
  onSwitchChange: (index: number, checked: boolean) => void
  onTimeChange: (index: number, newHour: TimeInputValue | null, isInit: boolean) => void
  extractHourAndMinute: (isoString: string) => TimeInputValue
}) => {
  return (
    <div className={`py-5 border-b border-gray-200 ${index === 0 ? 'border-t-0' : 'border-t'}`}>
      <div className='flex items-center justify-between'>
        <span className='font-semibold text-black'>{day.day}</span>
        <Switch size='md' isSelected={day.active} onChange={e => onSwitchChange(index, e.target.checked)} />
      </div>

      {day.active && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className='flex flex-col md:flex-row md:items-center md:justify-center mt-4 gap-3 pl-2'
        >
          <div className='flex items-center gap-3 w-full md:w-auto md:min-w-[200px]'>
            <span className='w-14 text-gray-500'>Desde:</span>
            <div className='w-full md:w-auto'>
              <TimeInput
                aria-label='Hora de inicio'
                hourCycle={24}
                value={extractHourAndMinute(day.hours[0].initUtcDate)}
                onChange={newHour => onTimeChange(index, newHour, true)}
                classNames={{
                  base: 'bg-gray-50 border-gray-200 w-[70px]'
                }}
              />
            </div>
          </div>
          <div className='flex items-center gap-3 w-full md:w-auto md:min-w-[200px]'>
            <span className='w-14 text-gray-500'>Hasta:</span>
            <div className='w-full md:w-auto'>
              <TimeInput
                aria-label='Hora de cierre'
                hourCycle={24}
                value={extractHourAndMinute(day.hours[0].endUtcDate)}
                onChange={newHour => onTimeChange(index, newHour, false)}
                classNames={{
                  base: 'bg-gray-50 border-gray-200 w-[70px] ml-1'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const HorarioPage: React.FC = () => {
  const commerceSchedule = useCommerceStore(state => state.commerceSchedule)
  const setCommerceSchedule = useCommerceStore(state => state.setCommerceSchedule)

  // Esta función solo actualiza la UI inmediatamente
  const updateUI = (newSchedule: typeof commerceSchedule) => {
    useCommerceStore.setState({ commerceSchedule: newSchedule })
  }

  // Esta función maneja la actualización en el servidor con debounce
  const debouncedSetSchedule = useDebouncedCallback(async newSchedule => {
    // Toast inmediato que indica que se está guardando
    toast.loading('Guardando horario...', {
      id: 'saving-schedule' // No necesitamos duration aquí
    })

    const result = await setCommerceSchedule(newSchedule)
    // Removemos el toast de carga
    toast.dismiss('saving-schedule')

    if (result?.error) {
      toast.error(result.error)
      // Si hay error, revertimos al estado anterior
      useCommerceStore.setState({ commerceSchedule: commerceSchedule })
    } else if (result?.success) {
      toast.success('Horario guardado', { duration: 1300 })
    }
  }, 1600)

  const updateSchedule = (dayIndex: number, newHour: hourType | null, isInit: boolean, isActive: boolean | null) => {
    const newSchedule = [...commerceSchedule]
    if (newHour !== null) {
      const date = new Date(Date.UTC(0, 0, 0, newHour.hour, newHour.minute))
      const isoString = date.toISOString()
      if (isInit) {
        newSchedule[dayIndex].hours[0].initUtcDate = isoString
      } else {
        newSchedule[dayIndex].hours[0].endUtcDate = isoString
      }
    }
    if (isActive !== null) {
      if (isActive) {
        const lastActiveDay = [...newSchedule].reverse().find(day => day.active)
        if (lastActiveDay) {
          newSchedule[dayIndex] = {
            ...newSchedule[dayIndex],
            active: isActive,
            hours: [
              {
                initUtcDate: lastActiveDay.hours[0].initUtcDate,
                endUtcDate: lastActiveDay.hours[0].endUtcDate
              }
            ]
          }
        } else {
          newSchedule[dayIndex].active = isActive
        }
      } else {
        newSchedule[dayIndex].active = isActive
      }
    }

    // Actualizamos la UI inmediatamente
    updateUI(newSchedule)
    // Enviamos la actualización al servidor en segundo plano
    debouncedSetSchedule(newSchedule)
  }

  const handleChange = (dayIndex: number, newHour: TimeInputValue | null, isInit: boolean) => {
    if (!newHour) return
    updateSchedule(
      dayIndex,
      {
        hour: newHour.hour,
        minute: newHour.minute,
        second: 0,
        millisecond: 0
      },
      isInit,
      null
    )
  }

  const handleSwitchChange = (dayIndex: number, isActive: boolean) => {
    updateSchedule(dayIndex, null, false, isActive)
  }

  const extractHourAndMinute = (isoString: string) => {
    const date = new Date(isoString)
    return {
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: 0,
      millisecond: 0
    } as TimeInputValue
  }

  return (
    <div className='w-full flex justify-center'>
      <div className='w-full max-w-[800px] md:bg-white md:rounded-xl md:shadow-sm md:my-6'>
        <h2 className='hidden md:block text-xl font-medium p-6 border-b'>Horario de atención</h2>
        <div className='px-5 md:px-6'>
          {commerceSchedule.map((day, index) => (
            <ScheduleRow
              key={index}
              day={day}
              index={index}
              onSwitchChange={handleSwitchChange}
              onTimeChange={handleChange}
              extractHourAndMinute={extractHourAndMinute}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HorarioPage
