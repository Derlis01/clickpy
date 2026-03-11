'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Input } from '@heroui/react'
import { Commerce, Product } from '@/types/PublicCommerceDataResponse'
import CategoryProducts from './CategoryProducts'
import CartResumeSticky from './CartResumeSticky'
import CategoryNavigation from './CategoryNavigation'

interface ProductSectionProps {
  commerceData: Commerce
  commerceProducts: Product[]
}

interface ProductsByCategory {
  [category: string]: Product[]
}

// Function to detect if a string starts with an emoji
const startsWithEmoji = (str: string): boolean => {
  // Simple check for common emoji ranges
  const firstChar = str.trim().charAt(0)
  const codePoint = firstChar.codePointAt(0)

  if (!codePoint) return false

  // Check common emoji ranges
  return (
    (codePoint >= 0x1f600 && codePoint <= 0x1f64f) || // Emoticons
    (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) || // Misc Symbols
    (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) || // Transport
    (codePoint >= 0x1f1e0 && codePoint <= 0x1f1ff) || // Flags
    (codePoint >= 0x2600 && codePoint <= 0x26ff) || // Misc symbols
    (codePoint >= 0x2700 && codePoint <= 0x27bf) || // Dingbats
    (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) // Supplemental Symbols
  )
}

export default function ProductSection({ commerceData, commerceProducts }: ProductSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const productsWithCategory = useMemo(() => {
    return commerceProducts.reduce<ProductsByCategory>((acc, product) => {
      const { category } = product
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(product)
      return acc
    }, {})
  }, [commerceProducts])

  const filteredProductsWithCategory = useMemo(() => {
    let result = productsWithCategory

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase()
      result = Object.entries(productsWithCategory).reduce<ProductsByCategory>((acc, [category, products]) => {
        const filteredProducts = products.filter(
          product =>
            product.productName.toLowerCase().includes(lowercasedSearchTerm) ||
            category.toLowerCase().includes(lowercasedSearchTerm)
        )
        if (filteredProducts.length > 0) {
          acc[category] = filteredProducts
        }
        return acc
      }, {})
    }

    // Sort categories: emoji categories first, then alphabetical
    const sortedEntries = Object.entries(result).sort(([categoryA], [categoryB]) => {
      const aStartsWithEmoji = startsWithEmoji(categoryA)
      const bStartsWithEmoji = startsWithEmoji(categoryB)

      if (aStartsWithEmoji && !bStartsWithEmoji) return -1
      if (!aStartsWithEmoji && bStartsWithEmoji) return 1

      return categoryA.localeCompare(categoryB)
    })

    return Object.fromEntries(sortedEntries)
  }, [productsWithCategory, searchTerm])

  const categoryCount = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.entries(filteredProductsWithCategory).forEach(([category, products]) => {
      counts[category] = products.length
    })
    return counts
  }, [filteredProductsWithCategory])

  const scrollToCategory = (category: string) => {
    categoryRefs.current[category]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const category = entry.target.getAttribute('data-category')
            if (category) {
              setActiveCategory(category)
            }
          }
        })
      },
      {
        rootMargin: '-50px 0px -50% 0px'
      }
    )

    Object.values(categoryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [filteredProductsWithCategory])

  return (
    <>
      <div className='flex items-center space-x-4 mb-6 mx-auto'>
        <Input
          type='text'
          placeholder='Buscar productos o categorías...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='flex-grow'
        />
      </div>

      <CategoryNavigation
        categories={Object.keys(filteredProductsWithCategory)}
        activeCategory={activeCategory}
        onCategoryClick={scrollToCategory}
        commerceName={commerceData.commerceName}
        categoryCount={categoryCount}
      />

      <div className='relative md:flex md:flex-wrap md:justify-between'>
        {Object.entries(filteredProductsWithCategory).map(([category, products]) => (
          <div
            className='pb-10'
            key={category}
            ref={(el: HTMLDivElement | null) => {
              categoryRefs.current[category] = el
            }}
            data-category={category}
          >
            <CategoryProducts categoryName={category} products={products} commerce={commerceData} />
          </div>
        ))}
        <CartResumeSticky />
      </div>
    </>
  )
}
