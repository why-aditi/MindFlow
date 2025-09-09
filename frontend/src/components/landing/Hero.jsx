import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Hero = ({ onGetStarted }) => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              {/* Main image placeholder - you can replace with actual image */}
              <div className="aspect-[4/5] bg-gradient-to-br from-purple-200 to-blue-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <motion.div
                    className="text-6xl"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🧘‍♀️
                  </motion.div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-2xl">✨</span>
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-xl">🌱</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="space-y-4">
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Healthy Habits,{' '}
                <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Big Rewards
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Earn points on MindFlow by completing wellness activities. These points can be redeemed for benefits such as free or discounted rent, products, and services. Healthy habits start here, with rewards for every step forward.
              </motion.p>
            </div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {[
                { number: '10K+', label: 'Active Users' },
                { number: '50K+', label: 'Points Earned' },
                { number: '95%', label: 'Satisfaction' }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
