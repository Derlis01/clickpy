'use client'

import { Button, Input, Switch } from '@heroui/react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface NewValueFormProps {
  onAccept: (name: string, price: string) => void
}

const NewValueForm: React.FC<NewValueFormProps> = ({ onAccept }) => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)

  const handleSubmit = () => {
    if (name && price) {
      onAccept(name, price)
      setName('')
      setPrice('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-3 mt-2'
    >
      <Input
        placeholder='Ej. Mediano, Rojo, Vainilla.'
        value={name}
        variant='bordered'
        onChange={e => setName(e.target.value)}
      />
      <Input
        type='number'
        placeholder='Gs. 55.000'
        variant='bordered'
        value={price}
        onChange={e => setPrice(e.target.value)}
      />
      <Button className='w-full' color='default' variant='faded' onPress={handleSubmit}>
        Aceptar
      </Button>
    </motion.div>
  )
}

export default NewValueForm
