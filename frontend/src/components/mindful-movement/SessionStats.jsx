const SessionStats = ({ selectedCategory, sessionState, sessionData, activitySettings }) => {
  if (sessionState !== 'active' && sessionState !== 'completed') return null

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-12">
      {selectedCategory === 'mental' ? (
        <>
          <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <div className="text-3xl font-light text-emerald-600 mb-2">
              {formatTime(sessionData.actualPoseTime)}
            </div>
            <div className="text-sm text-slate-600 font-medium">Correct Pose Time</div>
          </div>
          <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
            <div className="text-3xl font-light text-teal-600 mb-2">
              {formatTime(Math.max(0, (activitySettings.duration * 60) - sessionData.actualPoseTime))}
            </div>
            <div className="text-sm text-slate-600 font-medium">Remaining</div>
          </div>
          <div className="text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
            <div className="text-3xl font-light text-sky-600 mb-2">
              {sessionData.accuracy}%
            </div>
            <div className="text-sm text-slate-600 font-medium">Pose Accuracy</div>
          </div>
          <div className="text-center bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
            <div className="text-3xl font-light text-violet-600 mb-2">
              {sessionData.poseCorrect ? '✓' : '✗'}
            </div>
            <div className="text-sm text-slate-600 font-medium">Pose Status</div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <div className="text-3xl font-light text-emerald-600 mb-2">
              {sessionData.repCount}/{activitySettings.targetReps}
            </div>
            <div className="text-sm text-slate-600 font-medium">Reps Progress</div>
          </div>
          <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
            <div className="text-3xl font-light text-teal-600 mb-2">
              {Math.round((sessionData.repCount / activitySettings.targetReps) * 100)}%
            </div>
            <div className="text-sm text-slate-600 font-medium">Completion</div>
          </div>
          <div className="text-center bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100">
            <div className="text-3xl font-light text-sky-600 mb-2">
              {sessionData.accuracy}%
            </div>
            <div className="text-sm text-slate-600 font-medium">Form Accuracy</div>
          </div>
          <div className="text-center bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
            <div className="text-3xl font-light text-violet-600 mb-2">
              {sessionData.qualityScore}
            </div>
            <div className="text-sm text-slate-600 font-medium">Quality Score</div>
          </div>
        </>
      )}
    </div>
  )
}

// Helper function for time formatting
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default SessionStats
