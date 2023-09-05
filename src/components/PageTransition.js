import { motion } from 'framer-motion'
import { forwardRef } from 'react'

function PageTransition({ children, ...rest }, ref) {
  const initial = { opacity: 0 }
  const animate = { opacity: 1 }
  const exit = { opacity: 0 }

  const transition = { duration: 0.6, ease: 'easeInOut' }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default forwardRef(PageTransition)
