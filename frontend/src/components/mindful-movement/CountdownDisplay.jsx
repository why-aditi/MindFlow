import { motion } from 'framer-motion'

const CountdownDisplay = ({ countdown }) => {
  return (
    <div className="text-center">
      <motion.div
        key={countdown}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-8xl font-light text-emerald-600 mb-4"
      >
        {countdown}
      </motion.div>
      <p className="text-xl text-slate-600">
        {typeof countdown === 'number' ? 'Get ready to begin...' : 'Let\'s start!'}
      </p>
    </div>
  )
}

export default CountdownDisplay
