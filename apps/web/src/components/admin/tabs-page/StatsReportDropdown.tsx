'use client'

import { useState } from 'react'
import { ChevronDown } from 'react-feather'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'

export default function StatsReportDropdown() {
  const keyToTitleMap: { [key: string]: string } = {
    '7': '7 Días',
    '30': '30 Días'
  }

  const [selectedKey, setSelectedKey] = useState('7')

  const handleSelectionChange = (keys: any) => {
    if (typeof keys === 'object' && keys !== null && 'currentKey' in keys) {
      const key = (keys as any).currentKey
      if (typeof key === 'string') {
        setSelectedKey(key)
      }
    }
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <div className='flex items-center capitalize bg-gray-100 rounded-md px-4 py-1'>
          <span className='text-sm text-gray-500'>{keyToTitleMap[selectedKey]}</span>
          <ChevronDown size={16} className='ml-1' color='#B9B9B9' />
        </div>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Days'
        variant='flat'
        disallowEmptySelection
        selectionMode='single'
        selectedKeys={new Set([selectedKey])}
        onSelectionChange={handleSelectionChange}
      >
        <DropdownItem key='7'>7 Días</DropdownItem>
        <DropdownItem key='30'>30 Días</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
