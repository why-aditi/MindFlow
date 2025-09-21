import { Button } from '../ui/Button'
import { motion } from 'framer-motion'

const ExerciseCategorySelector = ({ onCategorySelect }) => {
  const categories = [
    {
      id: 'mental',
      name: 'Mindful Moments for Mental Wellness',
      description: 'Meditation and breathing exercises',
      icon: '🧘',
      color: 'from-violet-500 to-purple-500',
      hoverColor: 'from-violet-600 to-purple-600'
    },
    {
      id: 'physical',
      name: 'Physical Wellness',
      description: 'Bicep curls, squats, and strength training',
      icon: '💪',
      color: 'from-emerald-500 to-teal-500',
      hoverColor: 'from-emerald-600 to-teal-600'
    }
  ]

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {categories.map((category) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="group"
        >
          <Button
            onClick={() => onCategorySelect(category)}
            className={`w-full h-48 bg-gradient-to-br ${category.color} hover:${category.hoverColor} text-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
              <p className="text-lg opacity-90">{category.description}</p>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}

export default ExerciseCategorySelector
