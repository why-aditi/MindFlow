import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Hero = ({ onGetStarted }) => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-sky-50 via-emerald-50 to-teal-50 min-h-screen flex items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating clouds */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-16 bg-white/30 rounded-full blur-sm"
          animate={{ 
            x: [0, 50, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-12 bg-white/20 rounded-full blur-sm"
          animate={{ 
            x: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Gentle waves */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-teal-100/20 to-transparent"
          animate={{ 
            scaleX: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-emerald-100/50 rounded-full border border-emerald-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-emerald-600 text-sm font-medium">✨ Your Wellness Journey Starts Here</span>
              </motion.div>

              <motion.h1 
                className="text-5xl lg:text-7xl font-light text-slate-800 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Find Your{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                  Inner Peace
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-slate-600 leading-relaxed font-light max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Discover a world of mindfulness, meditation, and mental wellness. Join thousands who have found balance, peace, and joy through our gentle approach to mental health.
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
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Begin Your Journey
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium rounded-full border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-700 transition-all duration-300"
              >
                Explore Features
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="grid grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {[
                { number: '50K+', label: 'Lives Transformed' },
                { number: '98%', label: 'Feel More Peaceful' },
                { number: '4.9★', label: 'User Rating' }
              ].map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center p-4 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl font-light text-slate-800">{stat.number}</div>
                  <div className="text-sm text-slate-600 font-light">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main image with nature theme */}
              <div className="aspect-[3/4] bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl image-shadow-lg overflow-hidden border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=90"
                  alt="Peaceful meditation scene"
                  className="w-full h-full object-cover image-hover image-enhanced"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent"></div>
              </div>
              


            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
