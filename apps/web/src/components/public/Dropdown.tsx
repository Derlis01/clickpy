'use client'

import React from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, Selection } from "@heroui/react"
import { ChevronDown } from 'react-feather'

interface DropdownOption {
  key: string
  value: string
}

interface ReusableDropdownProps {
  options: DropdownOption[]
  defaultOption: string
  setSelectedKeys: (value: string) => void
}

export default function ReusableDropdown({ options, defaultOption, setSelectedKeys }: ReusableDropdownProps) {
  const [selectedKeys, setSelectedKeysLocal] = React.useState(new Set([defaultOption]))

  React.useEffect(() => {
    setSelectedKeys(Array.from(selectedKeys).join(', ').replaceAll('_', ' '))
  }, [selectedKeys])

  const handleSelectionChange = (selection: Selection) => {
    const selectionArray = Array.from(selection) as string[]
    if (selectionArray.length === 0) {
      setSelectedKeysLocal(new Set([defaultOption]))
    } else {
      setSelectedKeysLocal(new Set(selectionArray))
    }
  }

  // Find the values corresponding to the selected keys
  const selectedValues = Array.from(selectedKeys).map(key => {
    const option = options.find(option => option.key === key)
    return option ? option.value : ''
  })

  return (
    <Dropdown className='w-full'>
      <DropdownTrigger>
        <Button
          variant='bordered'
          radius='sm'
          className='w-full flex justify-between'
          endContent={
            <div>
              <ChevronDown size={20} color='#B9B9B9' />
            </div>
          }
        >
          {selectedValues.join(', ').replaceAll('_', ' ') || <span className='text-gray-500'>Seleccionar rubro</span>}{' '}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Single selection example'
        variant='flat'
        disallowEmptySelection
        className='w-full max-h-72 overflow-y-auto'
        selectionMode='single'
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
      >
        {options.map(option => (
          <DropdownItem key={option.key}>{option.value}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  )
}
