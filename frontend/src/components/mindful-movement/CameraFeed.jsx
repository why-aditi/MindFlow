import { Camera, AlertCircle } from 'lucide-react'

const CameraFeed = ({ 
  isTracking, 
  cameraStream, 
  cameraError, 
  videoRef, 
  poseTrackingActive, 
  selectedCategory, 
  sessionState, 
  sessionData 
}) => {
  if (!isTracking) return null

  return (
    <div className="mb-12">
      {/* Camera Video Feed */}
      <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl overflow-hidden mx-auto max-w-lg border border-emerald-200 shadow-wellness mb-8">
        {cameraStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-80 object-cover"
            onLoadedMetadata={() => console.log('Video metadata loaded')}
            onCanPlay={() => console.log('Video can play')}
            onError={(e) => console.error('Video error:', e)}
          />
        ) : (
          <div className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-slate-600 font-medium">Preparing camera...</p>
            </div>
          </div>
        )}
        {cameraError && (
          <div className="absolute inset-0 bg-rose-50/90 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-rose-600">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">{cameraError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Live Pose Tracking Info */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-light text-slate-700 mb-4">Live Pose Tracking</h3>
        <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${cameraStream ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <span>Camera: {cameraStream ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${poseTrackingActive ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <span>Tracking: {poseTrackingActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${videoRef.current ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <span>Video Element: {videoRef.current ? 'Ready' : 'Not Ready'}</span>
          </div>
        </div>
        
        {/* Pose Feedback for Mental Wellness */}
        {selectedCategory === 'mental' && sessionState === 'active' && (
          <div className="mt-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100 max-w-2xl mx-auto">
            <h4 className="text-lg font-medium text-slate-700 mb-3">Pose Guidance</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={`p-3 rounded-lg ${sessionData.accuracy >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <div className="font-medium">Landmark Visibility</div>
                <div className="text-lg font-bold">{sessionData.accuracy}%</div>
              </div>
              <div className={`p-3 rounded-lg ${sessionData.poseCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                <div className="font-medium">Pose Status</div>
                <div className="text-lg font-bold">{sessionData.poseCorrect ? '✓ All Visible' : '✗ Adjust'}</div>
              </div>
            </div>
            {sessionData.accuracy < 100 && (
              <div className="mt-4 text-sm text-slate-600">
                <p className="font-medium">Tips for better pose:</p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Sit with your back straight</li>
                  <li>Keep your hips lower than shoulders</li>
                  <li>Bend your knees in seated position</li>
                  <li>Center your head between shoulders</li>
                </ul>
                <p className="font-medium text-violet-600 mt-3">Timer only runs when the pose accuracy is at least 80%</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CameraFeed
