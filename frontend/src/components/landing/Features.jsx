import { motion } from 'framer-motion'

const Features = () => {
  const pillars = [
    {
      title: "Breathe",
      description: "Gentle breathing exercises and meditation practices that help you find calm in any moment. Learn to center yourself with guided sessions designed for all experience levels.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      color: "from-emerald-400 to-emerald-500"
    },
    {
      title: "Reflect",
      description: "Safe, private journaling with AI insights that help you understand your thoughts and emotions. Express yourself freely while gaining gentle guidance on your mental wellness journey.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      color: "from-teal-400 to-teal-500"
    },
    {
      title: "Connect",
      description: "Your personal AI companion is always here to listen, support, and guide you. Experience compassionate conversations that help you feel understood and never alone.",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      color: "from-cyan-400 to-cyan-500"
    },
    {
      title: "Grow",
      description: "Immersive VR experiences that transport you to peaceful environments. Practice mindfulness in beautiful, calming spaces designed to nurture your inner peace.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      color: "from-sky-400 to-sky-500"
    }
  ]

  return (
    <section id="features" className="py-24 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-32 left-20 w-32 h-32 bg-emerald-100/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-40 h-40 bg-teal-100/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-emerald-100/50 rounded-full border border-emerald-200/50 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span className="text-emerald-600 text-sm font-medium">🌸 Our Wellness Approach</span>
          </motion.div>

          <h2 className="text-4xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight">
            Four Pillars of{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
              Inner Peace
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            A gentle, holistic approach to mental wellness that nurtures your mind, body, and spirit through mindful practices and compassionate support.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="group bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="text-center space-y-6">
                <motion.div
                  className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${pillar.color} opacity-20`}></div>
                </motion.div>
                
                <h3 className="text-2xl font-light text-slate-800">
                  {pillar.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed font-light text-sm">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Advanced Features */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-teal-100/50 rounded-full border border-teal-200/50 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="text-teal-600 text-sm font-medium">✨ Advanced Wellness Technology</span>
            </motion.div>

            <h3 className="text-3xl lg:text-5xl font-light text-slate-800 mb-4">
              Gentle Technology for{' '}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                Deep Healing
              </span>
            </h3>
            <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
              Cutting-edge AI and immersive experiences designed with your wellbeing at heart
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Companion",
                description: "Your gentle, always-available wellness guide who listens without judgment and offers compassionate support",
                image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
                features: ["Natural conversations", "Mood tracking", "Crisis support", "Personalized insights"]
              },
              {
                title: "VR Meditation",
                description: "Transport yourself to serene environments designed to calm your mind and restore your inner balance",
                image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
                features: ["Ocean scenes", "Forest environments", "Guided sessions", "Customizable settings"]
              },
              {
                title: "Smart Journaling",
                description: "Express your thoughts safely with AI-powered insights that help you understand your mental patterns",
                image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
                features: ["Voice transcription", "Mood graphs", "Privacy protection", "Gentle insights"]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="space-y-6">
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-lg">
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-light text-slate-800 mb-3">{feature.title}</h4>
                    <p className="text-slate-600 font-light text-sm mb-4 leading-relaxed">{feature.description}</p>
                    
                    <ul className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-sm text-slate-500">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-3"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features
