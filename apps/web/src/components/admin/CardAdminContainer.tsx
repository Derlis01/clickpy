interface CardAdminContainerProps {
  title: string
  description?: string
  children: React.ReactNode
  optionalChildren?: React.ReactNode
}

export default function CardAdminContainer({
  title,
  description,
  children,
  optionalChildren
}: CardAdminContainerProps) {
  return (
    <div className='bg-white rounded-xl shadow-sm h-full border border-gray-200 transition-all duration-300 hover:shadow-md overflow-hidden'>
      <div className='flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50'>
        <div className='flex flex-col space-y-1'>
          <span className='font-semibold text-lg text-gray-800'>{title}</span>
          {description && (
            <span className='text-sm text-gray-500 text-pretty leading-relaxed max-w-sm'>{description}</span>
          )}
        </div>
        {optionalChildren}
      </div>
      <div className='p-6 flex-1 min-h-[200px] flex flex-col justify-center'>{children}</div>
    </div>
  )
}
