import { motion } from 'framer-motion'

const About = () => {
  return (
    <section id="about" className="py-24 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-40 h-40 bg-emerald-100/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-32 h-32 bg-teal-100/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left side - Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="aspect-[3/3] bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl image-shadow-lg overflow-hidden border border-white/20">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=90"
                  alt="Peaceful meditation and mindfulness"
                  className="w-full h-full object-cover image-hover image-enhanced"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/10 to-transparent"></div>
              </div>

            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-emerald-100/50 rounded-full border border-emerald-200/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-emerald-600 text-sm font-medium">🌱 About Our Mission</span>
            </motion.div>

            <motion.h2 
              className="text-4xl lg:text-6xl font-light text-slate-800 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Your Journey to{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                Mental Wellness
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-xl text-slate-600 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              MindFlow is your gentle companion on the path to inner peace and mental clarity. We believe that wellness should feel natural, accessible, and deeply personal. Our approach combines ancient wisdom with modern technology to create a sanctuary for your mind.
            </motion.p>

            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                { 
                  icon: "🧘‍♀️", 
                  title: "Mindful Meditation", 
                  description: "Guided sessions that calm your mind and restore inner balance" 
                },
                { 
                  icon: "🤖", 
                  title: "AI Companion", 
                  description: "Your personal wellness guide, available 24/7 with gentle support" 
                },
                { 
                  icon: "📝", 
                  title: "Gentle Journaling", 
                  description: "Express your thoughts safely with AI-powered insights and privacy" 
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30 hover:bg-white/70 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <h4 className="font-medium text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-slate-600 text-sm font-light">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
