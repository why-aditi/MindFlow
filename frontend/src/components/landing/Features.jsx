import { motion } from 'framer-motion'

const Features = () => {
  const pillars = [
    {
      title: "Move",
      description: "MindFlow offers coaching guidance with feedback from wearables and labs for insight to the right training for each resident to reach their specific goals on their fitness journey.",
      icon: "🏃‍♀️",
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Dream",
      description: "MindFlow uses automated in-unit fixtures and vetted sleep equipment to provide live feedback data for sleep quality, continuously improving rest in a custom sleep environment.",
      icon: "😴",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Recharge",
      description: "MindFlow partners with mindfulness apps and wellness partners to provide a range of meditation and breathwork guidance in an environment conducive to mindfulness.",
      icon: "🧘‍♀️",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Nourish",
      description: "MindFlow helps ensure residents identify the right nutrition on a highly tailored basis and makes it easy to attain recommended foods via delivery and meal partners.",
      icon: "🥗",
      color: "from-yellow-500 to-yellow-600"
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Four Pillars of Wellness
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Live a healthier, more balanced life – all from the comfort of your home.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="text-center space-y-6">
                <motion.div
                  className={`w-16 h-16 mx-auto bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {pillar.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-900">
                  {pillar.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Features
            </h3>
            <p className="text-lg text-gray-600">
              Powered by cutting-edge AI and immersive technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Companion",
                description: "24/7 mental health support with personalized conversations",
                icon: "🤖",
                features: ["Natural conversations", "Mood tracking", "Crisis intervention"]
              },
              {
                title: "VR Meditation",
                description: "Immersive environments for deep relaxation and mindfulness",
                icon: "🥽",
                features: ["Ocean scenes", "Forest environments", "Guided sessions"]
              },
              {
                title: "Smart Journaling",
                description: "Voice and text journaling with AI insights and mood analysis",
                icon: "📝",
                features: ["Voice transcription", "Mood graphs", "Privacy protection"]
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-xl font-bold text-gray-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
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
