import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

const Rewards = () => {
  const rewards = [
    {
      title: "Digital Rewards",
      description: "Unlock exclusive avatars, themes, and digital badges for your profile.",
      icon: "🏆",
      points: "100-500 pts"
    },
    {
      title: "Gift Cards",
      description: "Redeem points for gift cards to your favorite stores and services.",
      icon: "🎁",
      points: "500-2000 pts"
    },
    {
      title: "Premium Features",
      description: "Access advanced AI features, VR experiences, and personalized insights.",
      icon: "⭐",
      points: "1000-5000 pts"
    },
    {
      title: "Real-world Benefits",
      description: "Discounts on wellness products, fitness classes, and mental health services.",
      icon: "💰",
      points: "2000+ pts"
    }
  ]

  const activities = [
    { activity: "Daily meditation", points: 50 },
    { activity: "Journal entry", points: 30 },
    { activity: "VR session", points: 100 },
    { activity: "Weekly goal achieved", points: 200 },
    { activity: "Help a friend", points: 150 },
    { activity: "Learn something new", points: 75 }
  ]

  return (
    <section id="rewards" className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Earn While You Learn
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Turn your wellness journey into a rewarding experience. Every healthy habit earns you points that can be redeemed for amazing benefits.
          </p>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.title}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <div className="text-center space-y-4">
                <motion.div
                  className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {reward.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900">
                  {reward.title}
                </h3>
                
                <p className="text-gray-600 text-sm">
                  {reward.description}
                </p>
                
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-purple-700">
                    {reward.points}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How to Earn Points */}
        <motion.div 
          className="bg-white rounded-3xl p-12 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How to Earn Points
            </h3>
            <p className="text-lg text-gray-600">
              Simple activities that make a big difference in your mental wellness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-gray-700 font-medium">{item.activity}</span>
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  +{item.points}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-3xl p-12 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Earning?
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of young people who are already transforming their mental health journey into a rewarding experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Earning Points
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
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
