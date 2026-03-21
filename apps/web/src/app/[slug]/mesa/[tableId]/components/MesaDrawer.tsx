'use client'

import { Modal, ModalContent, Drawer, DrawerContent, Button } from '@heroui/react'
import { X, LogOut } from 'react-feather'
import useTableSessionStore, { GuestPresence } from '@/store/tableSessionStore'
import usePublicCart from '@/store/publicCart'
import usePublicCommerceStore from '@/store/publicCommerce'
import { useTableSocket } from '@/hooks/useTableSocket'
import { thousandsSeparator } from '@/utils/price'
import { useWindowSize } from '@/hooks/useWindowSize'
import ProductCartCard from '../../../components/ProductCartCard'
import CountdownBar from './CountdownBar'

interface MesaDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MesaDrawer({ isOpen, onClose }: MesaDrawerProps) {
  const { guests, isReady, countdown, lastRoundResult, displayName } = useTableSessionStore()
  const products = usePublicCart(state => state.products)
  const commerceData = usePublicCommerceStore(state => state.commerce)
  const { emit } = useTableSocket()
  const isDesktop = useWindowSize()

  const myProducts = products?.filter(p => p.organizationId === commerceData?.organizationId) ?? []

  const myTotal = myProducts.reduce((acc, product) => {
    let productTotal = product.price * product.quantity
    if (product.selections?.selectedOption) {
      productTotal = product.selections.selectedOption.price * product.quantity
    }
    if (product.selections?.selectedAddons) {
      productTotal += product.selections.selectedAddons.reduce((sum, addon) => sum + addon.price, 0) * product.quantity
    }
    return acc + productTotal
  }, 0)

  const handleReady = () => {
    emit('round:ready')
    useTableSessionStore.getState().setReady(true)
  }

  const handleUnready = () => {
    emit('round:unready')
    useTableSessionStore.getState().setReady(false)
  }

  const handleLeave = () => {
    const tableId = useTableSessionStore.getState().tableId
    if (tableId) {
      localStorage.removeItem(`mesa_session_${tableId}`)
    }
    usePublicCart.getState().clearProducts()
    useTableSessionStore.getState().reset()
    onClose()
  }

  const connectedGuests = guests.filter(g => g.is_connected)
  const otherGuests = connectedGuests.filter(g => g.display_name !== displayName)
  const confirmedCount = connectedGuests.filter(g => g.is_ready).length
  const totalGuests = connectedGuests.length

  const renderContent = () => (
    <div className='flex flex-col h-full bg-[#F9F7F4]'>
      {/* Header */}
      <div className='bg-white px-5 pt-5 pb-4 border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold text-lg'>Pedido de la mesa</h2>
          <Button isIconOnly variant='light' onPress={onClose} className='rounded-full'>
            <X size={20} />
          </Button>
        </div>

        {/* Guests pills */}
        {connectedGuests.length > 1 && (
          <div className='flex items-center gap-1.5 mt-3 flex-wrap'>
            {connectedGuests.map((guest, i) => {
              const isMe = guest.display_name === displayName
              return (
                <div
                  key={guest.guest_id ?? i}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                    isMe
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <div className='w-1.5 h-1.5 rounded-full bg-green-500 shrink-0' />
                  <span className='font-medium'>
                    {isMe ? 'Vos' : guest.display_name}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
        {/* Round status */}
        {lastRoundResult && (
          <RoundStatus round={lastRoundResult.round} />
        )}

        {/* Countdown */}
        {countdown.active && countdown.ends_at && (
          <CountdownBar endsAt={countdown.ends_at} />
        )}

        {/* Confirmation progress */}
        {confirmedCount > 0 && !countdown.active && !lastRoundResult && (
          <div className='bg-blue-50 border border-blue-100 rounded-xl p-3 text-center'>
            <p className='text-blue-700 text-sm'>
              {confirmedCount}/{totalGuests} confirmaron
            </p>
          </div>
        )}

        {/* My items — under my name for consistency */}
        <div>
          <p className='text-xs text-gray-400 font-medium mb-2 px-1'>Vos</p>
          {myProducts.length === 0 ? (
            <div className='bg-white rounded-lg px-3 py-4 text-center'>
              <p className='text-gray-300 text-sm'>Sin productos</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {myProducts.map(product => (
                <ProductCartCard key={product.unicCartId} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Other guests' items — read only */}
        {otherGuests.map(guest => (
          <GuestItems key={guest.guest_id ?? guest.display_name} guest={guest} />
        ))}
      </div>

      {/* Footer */}
      <div className='bg-white border-t border-gray-200 px-5 py-4 space-y-3'>
        {myTotal > 0 && (
          <div className='flex justify-between'>
            <span className='text-gray-500 text-sm'>Tu total</span>
            <span className='font-bold text-lg'>Gs. {thousandsSeparator(myTotal)}</span>
          </div>
        )}

        {isReady ? (
          <Button
            color='danger'
            variant='flat'
            size='lg'
            radius='sm'
            className='w-full'
            onPress={handleUnready}
          >
            Cancelar
          </Button>
        ) : (
          <Button
            color='primary'
            size='lg'
            radius='sm'
            className='w-full font-semibold'
            style={commerceData?.commercePrimaryColor ? { backgroundColor: commerceData.commercePrimaryColor, color: '#fff' } : undefined}
            onPress={handleReady}
            isDisabled={myProducts.length === 0}
          >
            Confirmar pedido
          </Button>
        )}

        <button
          onClick={handleLeave}
          className='flex items-center justify-center gap-1.5 w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors'
        >
          <LogOut size={12} />
          <span>Salir de la mesa</span>
        </button>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement='right'
        size='lg'
        hideCloseButton
        classNames={{
          base: 'bg-white',
          body: 'p-0'
        }}
      >
        <DrawerContent>{renderContent()}</DrawerContent>
      </Drawer>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='full'
      hideCloseButton
      classNames={{
        base: 'bg-[#F9F7F4]',
        body: 'p-0'
      }}
    >
      <ModalContent>{renderContent()}</ModalContent>
    </Modal>
  )
}

/** Read-only list of what another guest ordered */
function GuestItems({ guest }: { guest: GuestPresence }) {
  return (
    <div>
      <p className='text-xs text-gray-400 font-medium mb-2 px-1'>
        {guest.display_name}
      </p>
      {!guest.items || guest.items.length === 0 ? (
        <div className='bg-white rounded-lg px-3 py-4 text-center'>
          <p className='text-gray-300 text-sm'>Sin productos</p>
        </div>
      ) : (
        <div className='space-y-1.5'>
          {guest.items.map((item, i) => (
            <div key={i} className='flex items-center justify-between bg-white rounded-lg px-3 py-2.5'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-400 font-medium'>{item.quantity}x</span>
                <span className='text-sm text-gray-700'>{item.product_name}</span>
              </div>
              {item.price > 0 && (
                <span className='text-xs text-gray-400'>Gs. {thousandsSeparator(item.price)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Status of a sent round */
function RoundStatus({ round }: { round: number }) {
  return (
    <div className='bg-green-50 border border-green-100 rounded-xl p-4'>
      <div className='flex items-center gap-3'>
        <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0' />
        <div>
          <p className='text-green-800 font-medium text-sm'>Pedido enviado a cocina</p>
          <p className='text-green-600 text-xs mt-0.5'>Ronda {round} — preparando tu pedido</p>
        </div>
      </div>
    </div>
  )
}
