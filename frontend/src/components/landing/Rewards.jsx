import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Rewards = () => {
  const rewards = [
    {
      title: "Wellness Products",
      description: "Essential oils, meditation cushions, and other tools to enhance your practice.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      points: "500-1500 pts"
    },
    {
      title: "Premium Content",
      description: "Access to exclusive guided meditations, VR experiences, and wellness courses.",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      points: "300-1000 pts"
    },
    {
      title: "Wellness Services",
      description: "Discounts on therapy sessions, wellness coaching, and mental health consultations.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      points: "1000-3000 pts"
    },
    {
      title: "Digital Rewards",
      description: "Beautiful themes, calming wallpapers, and personalized wellness trackers.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=90",
      points: "100-500 pts"
    }
  ]

  const activities = [
    { activity: "Daily meditation", points: 50, icon: "🧘‍♀️" },
    { activity: "Mindful journaling", points: 30, icon: "📝" },
    { activity: "VR relaxation", points: 100, icon: "🥽" },
    { activity: "Weekly reflection", points: 200, icon: "🌙" },
    { activity: "Helping others", points: 150, icon: "🤝" },
    { activity: "Learning & growth", points: 75, icon: "🌱" },
    { activity: "Community participation", points: 40, icon: "👥" },
    { activity: "Supporting peers", points: 60, icon: "💬" },
    { activity: "Sharing experiences", points: 80, icon: "📖" }
  ]

  return (
    <section id="rewards" className="py-24 bg-gradient-to-br from-teal-50 via-cyan-50/30 to-sky-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-40 h-40 bg-teal-100/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-100/30 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
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
          <h2 className="text-4xl lg:text-6xl font-light text-slate-800 mb-6 leading-tight">
            Nurture Yourself,{' '}
            <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 bg-clip-text text-transparent font-normal">
              Earn Rewards
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
            Every moment of mindfulness and self-care earns you points toward meaningful rewards that support your continued wellness journey.
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.title}
              className="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/30"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="relative h-36 overflow-hidden">
                <img 
                  src={reward.image}
                  alt={reward.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                
                {/* Points badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-teal-700">
                    {reward.points}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-light text-slate-800 mb-2">{reward.title}</h3>
                <p className="text-slate-600 text-sm font-light leading-relaxed">{reward.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How to Earn Points */}
        <motion.div 
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-lg border border-white/30 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-light text-slate-800 mb-4">
              How to Earn{' '}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                Wellness Points
              </span>
            </h3>
            <p className="text-lg text-slate-600 font-light">
              Simple, mindful activities that contribute to your wellbeing and earn you rewards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activities.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 rounded-2xl hover:shadow-md transition-all duration-300 border border-white/30"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-slate-700 font-medium">{item.activity}</span>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  +{item.points}
                </div>
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
              Start Your{' '}
              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent font-normal">
                Rewarding Journey
              </span>
            </h3>
            <p className="text-lg text-slate-600 mb-8 font-light max-w-2xl mx-auto">
              Join thousands who are transforming their mental wellness journey into a rewarding experience. Every mindful moment counts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Begin Earning Points
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-medium rounded-full border-2 border-teal-200 hover:border-teal-300 hover:bg-teal-50/50 text-teal-700 transition-all duration-300"
              >
                View Rewards Catalog
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Rewards
