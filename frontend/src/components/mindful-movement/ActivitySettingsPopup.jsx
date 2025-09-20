import { Button } from '../ui/Button'
import { X } from 'lucide-react'

const ActivitySettingsPopup = ({ 
  isOpen, 
  onClose, 
  selectedActivity, 
  selectedCategory, 
  activitySettings, 
  onSettingsChange, 
  onStart 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              {selectedActivity?.name} Settings
            </h3>
            <p className="text-slate-600 mt-1">
              Configure your {selectedActivity?.name.toLowerCase()} session
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {selectedCategory === 'mental' ? (
            // Mental wellness: Duration only
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">
                Duration
              </label>
              <select
                value={activitySettings.duration}
                onChange={(e) => onSettingsChange({ duration: parseFloat(e.target.value) })}
                className="w-full p-4 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-slate-700"
              >
                <option value={0.5}>30 seconds</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Choose how long you'd like to practice mindfulness
              </p>
            </div>
          ) : (
            // Physical wellness: Reps only
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-3">
                Target Repetitions
              </label>
              <select
                value={activitySettings.targetReps}
                onChange={(e) => onSettingsChange({ targetReps: parseInt(e.target.value) })}
                className="w-full p-4 border border-emerald-200 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-slate-700"
              >
                <option value={1}>1 rep</option>
                <option value={5}>5 reps</option>
                <option value={10}>10 reps</option>
                <option value={15}>15 reps</option>
                <option value={20}>20 reps</option>
                <option value={25}>25 reps</option>
                <option value={30}>30 reps</option>
                <option value={40}>40 reps</option>
                <option value={50}>50 reps</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Choose how many repetitions you'd like to complete
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            Start Session
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ActivitySettingsPopup
