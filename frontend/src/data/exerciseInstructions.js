export const getExerciseInstructions = (exerciseId) => {
  const instructions = {
    bicep_curl: {
      steps: [
        'Stand with feet shoulder-width apart',
        'Hold weights with arms at your sides',
        'Curl weights up to your shoulders',
        'Lower weights back down slowly'
      ],
      tips: [
        'Keep your elbows close to your body',
        'Don\'t swing the weights',
        'Control the movement both up and down'
      ]
    },
    squats: {
      steps: [
        'Stand with feet shoulder-width apart',
        'Lower your body as if sitting back',
        'Keep your chest up and knees behind toes',
        'Return to standing position'
      ],
      tips: [
        'Keep your weight on your heels',
        'Don\'t let your knees cave inward',
        'Go as low as comfortable'
      ]
    },
    coming_soon: {
      steps: [
        'This exercise is coming soon',
        'Stay tuned for updates',
        'Check back later for new content'
      ],
      tips: [
        'More exercises are being developed',
        'Follow our updates for new releases'
      ]
    },
    coming_soon_mental: {
      steps: [
        'This mindfulness practice is coming soon',
        'Stay tuned for updates',
        'Check back later for new content'
      ],
      tips: [
        'More mindfulness practices are being developed',
        'Follow our updates for new releases'
      ]
    }
  }
  return instructions[exerciseId] || instructions.bicep_curl
}
