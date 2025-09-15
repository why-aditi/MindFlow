import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Wellness = () => {
  const practices = [
    {
      title: "Morning Meditation",
      description: "Start your day with gentle mindfulness practices that set a peaceful tone for everything ahead.",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=90",
      duration: "5-15 min",
      level: "Beginner"
    },
    {
      title: "Breathing Exercises",
      description: "Learn powerful breathing techniques that instantly calm your nervous system and restore balance.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=90",
      duration: "3-10 min",
      level: "All Levels"
    },
    {
      title: "Evening Reflection",
      description: "Wind down with gentle journaling and reflection practices that help you process your day peacefully.",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=90",
      duration: "10-20 min",
      level: "Beginner"
    },
    {
      title: "VR Nature Walks",
      description: "Immerse yourself in beautiful natural environments designed to reduce stress and promote deep relaxation.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=90",
      duration: "15-30 min",
      level: "All Levels"
    }
  ]

  const benefits = [
    {
      icon: "🧘‍♀️",
      title: "Reduced Stress",
      description: "Lower cortisol levels and feel more relaxed throughout your day"
    },
    {
      icon: "😌",
      title: "Better Sleep",
      description: "Improve sleep quality with calming bedtime practices"
    },
    {
      icon: "💭",
      title: "Mental Clarity",
      description: "Clear your mind and focus better on what truly matters"
    },
    {
      icon: "❤️",
      title: "Emotional Balance",
      description: "Develop healthier emotional responses and inner peace"
    }
  ]

  return (
    <section id="wellness" className="py-24 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-48 h-48 bg-emerald-100/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-36 h-36 bg-teal-100/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
        
        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-emerald-300/40 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-3 h-3 bg-teal-300/40 rounded-full"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
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
            <span className="text-emerald-600 text-sm font-medium">🌿 Daily Wellness Practices</span>
          </motion.div>

          <h2 className="text-4xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight">
            Nurture Your{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
              Inner Garden
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Discover gentle practices that help you cultivate peace, resilience, and joy in your daily life. Each moment of mindfulness is a step toward greater wellbeing.
          </p>
        </motion.div>

        {/* Wellness Practices */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {practices.map((practice, index) => (
            <motion.div
              key={practice.title}
              className="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={practice.image}
                alt={practice.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                
                {/* Duration and Level badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
                    {practice.duration}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100/90 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-700">
                    {practice.level}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-light text-slate-800 mb-3">{practice.title}</h3>
                <p className="text-slate-600 font-light leading-relaxed">{practice.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-5xl font-light text-slate-800 mb-4">
              The Science of{' '}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                Inner Peace
              </span>
            </h3>
            <p className="text-lg text-slate-600 font-light max-w-2xl mx-auto">
              Research shows that regular mindfulness practices can transform your mental and physical wellbeing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/70 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h4 className="text-lg font-medium text-slate-800 mb-2">{benefit.title}</h4>
                <p className="text-slate-600 text-sm font-light">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/30 max-w-4xl mx-auto">
            <h3 className="text-3xl lg:text-4xl font-light text-slate-800 mb-4">
              Ready to Begin Your{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-normal">
                Wellness Journey?
              </span>
            </h3>
            <p className="text-lg text-slate-600 mb-8 font-light max-w-2xl mx-auto">
              Join thousands who have discovered the transformative power of mindful living. Your path to inner peace starts with a single breath.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Meditating Today
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium rounded-full border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-emerald-700 transition-all duration-300"
              >
                Explore All Practices
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Wellness
