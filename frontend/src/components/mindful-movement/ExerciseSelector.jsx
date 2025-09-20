import { Button } from '../ui/Button'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const ExerciseSelector = ({ selectedCategory, exercises, onExerciseSelect, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-emerald-50 text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Button>
      </div>

      {/* Category Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-light text-slate-800 mb-4">
          {selectedCategory.name}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {selectedCategory.description}
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group"
          >
            <Button
              onClick={() => onExerciseSelect(exercise)}
              className={`w-full h-32 bg-gradient-to-br ${exercise.color} hover:${exercise.hoverColor} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{exercise.icon}</div>
                <h3 className="text-lg font-semibold">{exercise.name}</h3>
                <p className="text-sm opacity-90 mt-1">{exercise.description}</p>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default ExerciseSelector
