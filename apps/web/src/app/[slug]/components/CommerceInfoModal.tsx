import React, { useEffect } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@heroui/react'
import usePublicCommerceStore from '@/store/publicCommerce'
import { Facebook, Info, Instagram } from 'react-feather'
import WhatsappLogo from '../../../../public/whatsapp-logo'

export default function CommerceScheduleModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const commerce = usePublicCommerceStore(state => state.commerce)
  const setIsCommerceOpen = usePublicCommerceStore(state => state.setCommerceOpen)

  const formatTime = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toISOString().substring(11, 16)
  }

  const isCurrentTimeInRange = (initUtcDate: Date, endUtcDate: Date) => {
    const now = new Date()
    const initHour = initUtcDate.getUTCHours()
    const initMinutes = initUtcDate.getUTCMinutes()
    const endHour = endUtcDate.getUTCHours()
    const endMinutes = endUtcDate.getUTCMinutes()

    // Convertir todo a minutos para facilitar la comparación
    const nowInMinutes = now.getHours() * 60 + now.getMinutes()
    const initInMinutes = initHour * 60 + initMinutes
    const endInMinutes = endHour * 60 + endMinutes

    // Si el horario cruza la medianoche (end es menor que init)
    if (endInMinutes < initInMinutes) {
      // Si estamos después de medianoche, solo verificamos hasta la hora de cierre
      if (nowInMinutes < initInMinutes) {
        return nowInMinutes <= endInMinutes
      }
      // Si estamos antes de medianoche, verificamos desde la hora de apertura
      return nowInMinutes >= initInMinutes
    }

    // Horario normal (mismo día)
    return nowInMinutes >= initInMinutes && nowInMinutes <= endInMinutes
  }

  useEffect(() => {
    if (!commerce?.commerceSchedule) {
      setIsCommerceOpen(false)
      return
    }

    const now = new Date()
    const currentDayNumber = now.getDay()
    const currentHour = now.getHours()

    // Si es entre medianoche y 6am, también verificamos el día anterior
    const isAfterMidnight = currentHour >= 0 && currentHour < 6
    const previousDayNumber = (currentDayNumber - 1 + 7) % 7 // Asegura que si es 0 (domingo) vuelva a 6 (sábado)

    // Buscar el horario del día actual
    const todaySchedule = commerce?.commerceSchedule?.find(day => day.dayNumber === currentDayNumber)

    // Si es después de medianoche, también buscar el horario del día anterior
    const yesterdaySchedule = isAfterMidnight
      ? commerce?.commerceSchedule?.find(day => day.dayNumber === previousDayNumber)
      : null

    const isOpenNow =
      // Verifica el horario normal del día actual
      (todaySchedule?.active &&
        todaySchedule.hours.length > 0 &&
        isCurrentTimeInRange(
          new Date(todaySchedule.hours[0].initUtcDate),
          new Date(todaySchedule.hours[0].endUtcDate)
        )) ||
      // O verifica si viene del día anterior y cruza la medianoche
      (isAfterMidnight &&
        yesterdaySchedule?.active &&
        yesterdaySchedule.hours.length > 0 &&
        isCurrentTimeInRange(
          new Date(yesterdaySchedule.hours[0].initUtcDate),
          new Date(yesterdaySchedule.hours[0].endUtcDate)
        ))

    setIsCommerceOpen(isOpenNow ? true : false)
  }, [commerce, setIsCommerceOpen])

  const currentDayNumber = new Date().getDay()
  const todaySchedule = commerce?.commerceSchedule?.find(day => day.dayNumber === currentDayNumber)
  const isOpenNow = commerce?.commerceSchedule
    ? todaySchedule?.active &&
      todaySchedule.hours.length > 0 &&
      isCurrentTimeInRange(new Date(todaySchedule.hours[0].initUtcDate), new Date(todaySchedule.hours[0].endUtcDate))
    : false
  const tableColor = isOpenNow ? 'success' : 'danger'
  const infoColor = isOpenNow ? '#17c964' : '#f31260'

  return (
    <>
      <Info onClick={onOpen} size={28} color={infoColor} />
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop='blur' isKeyboardDismissDisabled={true}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>{commerce?.commerceName.toLocaleUpperCase()}</ModalHeader>
              <ModalBody>
                <h3 className='font-semibold'>Horario de atención</h3>
                {commerce?.commerceSchedule ? (
                  <Table
                    removeWrapper
                    aria-label='Horario del comercio'
                    color={tableColor}
                    selectionMode='single'
                    defaultSelectedKeys={[currentDayNumber.toString()]}
                  >
                    <TableHeader>
                      <TableColumn className='py-3'>Día</TableColumn>
                      <TableColumn className='flex items-center justify-end py-6'>Horario</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {commerce?.commerceSchedule?.length ? (
                        commerce?.commerceSchedule.map(day => (
                          <TableRow key={day.dayNumber.toString()} className='border-b-1 border-gray-100'>
                            <TableCell>{day.day}</TableCell>
                            <TableCell className='flex items-center justify-end'>
                              {day.active && day.hours.length > 0
                                ? `${formatTime(day.hours[0].initUtcDate)} - ${formatTime(day.hours[0].endUtcDate)}`
                                : 'Cerrado'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3}>No hay horarios disponibles</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <div className='flex flex-col items-center justify-center p-6 my-4 bg-gray-50 rounded-lg border border-gray-100'>
                    <Info size={24} className='text-gray-400 mb-2' />
                    <p className='text-gray-600 text-sm font-medium'>
                      Este comercio aún no tiene horarios configurados
                    </p>
                    <p className='text-gray-400 text-xs mt-1'>Vuelve a consultar más tarde</p>
                  </div>
                )}
                <div className='mb-4' />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
