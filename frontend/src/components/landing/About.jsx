import { motion } from 'framer-motion'

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              About MindFlow
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Enjoy all your favorite wellness content in one convenient place. MindFlow seamlessly integrates the four pillars of wellness, transforming everyday living into a health-centered experience and increase your longevity.
            </motion.p>

            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">AI-powered wellness companion</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Personalized mental health tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Immersive VR meditation experiences</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Rewards for healthy habits</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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
                  🧘‍♂️
                </motion.div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 bg-purple-400 rounded-full flex items-center justify-center shadow-lg"
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
              <span className="text-2xl">💭</span>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center shadow-lg"
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
              <span className="text-xl">📱</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
