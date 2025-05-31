import React from 'react'
import { motion } from 'framer-motion'

function RootDiv({ children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 90 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 90 }}
      transition={{
        duration: 0.6,
        ease: [0.075, 0.82, 0.165, 1]
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default RootDiv
