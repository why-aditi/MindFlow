import { motion, AnimatePresence } from 'framer-motion'
import { X, Rocket, Sparkles, Clock, Bell } from 'lucide-react'
import { Button } from './Button'

const ComingSoonPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="inline-block mb-4"
                  >
                    <Rocket size={48} />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
                  <p className="text-emerald-100 text-sm">
                    We're working on something amazing
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
                    <Sparkles size={20} className="text-yellow-500" />
                    <span className="text-sm font-medium">New Practice Coming</span>
                    <Sparkles size={20} className="text-yellow-500" />
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    We're developing new exciting practices to enhance your wellness journey. 
                    Stay tuned for updates!
                  </p>

                  {/* Features preview */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Clock size={16} className="text-blue-500" />
                      <span>AI-powered form tracking</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Bell size={16} className="text-green-500" />
                      <span>Real-time feedback</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Sparkles size={16} className="text-purple-500" />
                      <span>Personalized workouts</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ComingSoonPopup
