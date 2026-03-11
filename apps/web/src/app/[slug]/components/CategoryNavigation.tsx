import React, { useRef, useEffect } from 'react'
import { useScrollPosition } from '@/hooks/useScrollPosition'

interface CategoryNavigationProps {
  categories: string[]
  activeCategory: string
  onCategoryClick: (category: string) => void
  commerceName: string
  categoryCount: Record<string, number>
}

export default function CategoryNavigation({
  categories,
  activeCategory,
  onCategoryClick,
  commerceName,
  categoryCount
}: CategoryNavigationProps) {
  const scrollPosition = useScrollPosition()
  const showNavigation = scrollPosition > 200
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const activeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeButtonRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        const container = scrollContainerRef.current
        const button = activeButtonRef.current
        if (!container || !button) return

        const containerRect = container.getBoundingClientRect()
        const buttonRect = button.getBoundingClientRect()

        const scrollLeft = button.offsetLeft - containerRect.width / 2 + buttonRect.width / 2

        container.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [activeCategory])

  const scrollToCategory = (category: string) => {
    onCategoryClick(category)

    setTimeout(() => {
      try {
        const possibleSelectors = [
          `#${category}`,
          `[data-category="${category}"]`,
          `h2:contains("${category}")`,
          `.category-${category}`
        ]

        let targetElement: Element | null = null

        for (const selector of possibleSelectors) {
          try {
            if (selector.includes(':contains')) {
              const tagName = selector.split(':')[0]
              const matches = selector.match(/"([^"]+)"/)
              const searchText = matches ? matches[1] : category
              const elements = Array.from(document.querySelectorAll(tagName))

              for (const el of elements) {
                if (el.textContent?.includes(searchText)) {
                  targetElement = el
                  break
                }
              }
            } else {
              const element = document.querySelector(selector)
              if (element) {
                targetElement = element
                break
              }
            }
          } catch (error) {
            continue
          }
        }

        if (!targetElement) {
          const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
          for (const header of headers) {
            if (header.textContent?.includes(category)) {
              targetElement = header
              break
            }
          }
        }

        if (targetElement) {
          const elementRect = targetElement.getBoundingClientRect()
          const navHeight = document.querySelector('div.fixed')?.clientHeight || 100
          const offsetCorrection = 50
          const y = elementRect.top + window.pageYOffset - navHeight - offsetCorrection

          window.scrollTo({
            top: y,
            behavior: 'smooth'
          })
        }
      } catch (err) {
        // Silently fail in production
      }
    }, 300)
  }

  const handleCategoryClick = (category: string) => {
    if (category === activeCategory) return
    scrollToCategory(category)
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showNavigation ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className='bg-white border-b border-gray-100 shadow-sm'>
        <div className='max-w-7xl mx-auto px-2 sm:px-6 lg:px-8'>
          <div className='text-center py-0.5 sm:py-2 border-b border-gray-100'>
            <h2 className='text-base sm:text-lg font-medium text-gray-900'>{commerceName}</h2>
          </div>

          <div className='relative'>
            <div className='overflow-x-auto no-scrollbar relative' ref={scrollContainerRef}>
              <div className='flex space-x-3 sm:space-x-4 py-1 sm:py-2 items-center justify-start min-w-full'>
                {categories.map(category => (
                  <button
                    key={category}
                    ref={category === activeCategory ? activeButtonRef : null}
                    onClick={() => handleCategoryClick(category)}
                    className={`
                      px-1 py-1 text-xs sm:text-sm font-medium
                      transition-all duration-200 ease-out
                      whitespace-nowrap flex items-center gap-1 sm:gap-2
                      touch-manipulation relative
                      ${
                        activeCategory === category
                          ? 'text-gray-900 font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className='relative'>
                      {category}
                      {activeCategory === category && (
                        <span className='absolute bottom-[-4px] left-0 w-full h-0.5 bg-gray-900 rounded-full' />
                      )}
                    </span>
                    <span
                      className={`
                      text-[10px] px-1 rounded-sm
                      ${activeCategory === category ? 'text-gray-900' : 'text-gray-500'}
                    `}
                    >
                      {categoryCount?.[category] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
