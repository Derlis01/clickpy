'use client'

import { useState } from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js'
import { Button } from "@heroui/react"

interface PhoneNumberInputProps {
  onPhoneNumberChange: (number: string) => void
  setIsValidPhoneNumber: (isValid: boolean) => void
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ onPhoneNumberChange, setIsValidPhoneNumber }) => {
  const [phone, setPhone] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const handleChange = (value: string) => {
    setPhone(value)

    const parsedNumber = parsePhoneNumberFromString(value, 'PY')

    if (parsedNumber) {
      const valid = isValidPhoneNumber(parsedNumber.number, 'PY')
      setIsValid(valid)
      setIsValidPhoneNumber(valid)
      setErrorMessage(valid ? '' : 'El número de teléfono no es válido.')
      onPhoneNumberChange(valid ? parsedNumber.number : '')
    } else {
      setIsValid(false)
      setErrorMessage('El número de teléfono no es válido.')
      onPhoneNumberChange('')
    }
  }

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <PhoneInput
          country={'py'}
          value={phone}
          onChange={handleChange}
          inputStyle={{
            width: '100%',
            borderColor: isValid ? '#d4d4d8' : '#ff4d4f',
            borderRadius: '8px',
            height: '40px',
            borderWidth: '2px',
            borderStyle: 'solid'
          }}
          inputClass=''
        />
        {!isValid && <span className='text-xs text-red-500'>{errorMessage}</span>}
      </div>
    </>
  )
}

export default PhoneNumberInput
