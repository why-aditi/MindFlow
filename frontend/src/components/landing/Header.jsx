import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Header = ({ onGetStarted }) => {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">MF</span>
            </div>
            <span className="text-xl font-bold text-gray-900">MindFlow</span>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['About', 'Features', 'Wellness', 'Rewards', 'Contact'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-full font-medium"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
