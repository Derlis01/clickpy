import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, CheckCircle } from 'react-feather'

interface UserTaskProps {
  title: string
  description: string
  isCompleted: boolean
  path: string
}

export default function UserTask({ title, description, isCompleted, path }: UserTaskProps) {
  const ChevronRightAnimated = (
    <motion.div
      initial={{ x: 0, color: '#B4B4B4' }}
      animate={{
        x: [0, 10, 0, 5, 0, 2, 0, 1, 0],
        color: ['#B4B4B4', '#17C964', '#17C964', '#17C964', '#B4B4B4']
      }}
      transition={{
        times: [0, 0.25, 0.5, 0.75, 1],
        duration: 1.5,
        delay: 2,
        ease: 'easeInOut'
      }}
    >
      <ChevronRight size={24} />
    </motion.div>
  )

  const TaskContent = (
    <div className='flex items-center gap-5'>
      <div>
        <h3 className={`text-base mb-2 font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-pretty'}`}>
          {title}
        </h3>
        <p className={`text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-500 text-pretty'}`}>
          {description}
        </p>
      </div>
      <div>{isCompleted ? <CheckCircle size={24} color='#17C964' /> : ChevronRightAnimated}</div>
    </div>
  )

  return (
    <div className='border-t-2 border-gray-100 last:border-b-2 py-5'>
      {isCompleted ? TaskContent : <Link href={path}>{TaskContent}</Link>}
    </div>
  )
}
