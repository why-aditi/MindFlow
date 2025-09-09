import { motion } from 'framer-motion'

const YouthCentric = () => {
  const youthFeatures = [
    {
      title: "Gamified Wellness",
      description: "Turn your mental health journey into an engaging game with achievements, streaks, and rewards.",
      icon: "🎮",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Social Connection",
      description: "Connect with peers, share achievements, and build a supportive community of like-minded individuals.",
      icon: "👥",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Creative Expression",
      description: "Express yourself through art, music, and creative journaling with AI-powered insights.",
      icon: "🎨",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Tech Integration",
      description: "Seamlessly integrate with your favorite apps, wearables, and social media platforms.",
      icon: "📱",
      color: "from-yellow-500 to-orange-500"
    }
  ]

  return (
    <section id="youth" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for the Next Generation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Designed with young people in mind - combining cutting-edge technology with intuitive, engaging experiences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {youthFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className={`w-20 h-20 mx-auto bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center text-4xl shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-900">
                {feature.title}
              </h3>
              
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Visual showcase */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900">
                Your Wellness Journey, Your Way
              </h3>
              <p className="text-lg text-gray-600">
                Whether you're a student, gamer, artist, or athlete, MindFlow adapts to your lifestyle and preferences.
              </p>
            </div>

            <div className="space-y-6">
              {[
                "Customizable avatars and themes",
                "Integration with Discord, Twitch, and gaming platforms",
                "Study break reminders and focus sessions",
                "Art therapy and creative expression tools",
                "Peer support groups and mentorship programs"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <span className="text-gray-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-2xl overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
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
                  🎯
                </motion.div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
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
              <span className="text-2xl">🚀</span>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg"
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
              <span className="text-xl">💫</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default YouthCentric
