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
    push_ups: {
      steps: [
        'Start in plank position',
        'Lower your chest toward the ground',
        'Keep your body in a straight line',
        'Push back up to starting position'
      ],
      tips: [
        'Keep your core tight',
        'Don\'t let your hips sag or pike up',
        'Breathe out as you push up'
      ]
    }
  }
  return instructions[exerciseId] || instructions.bicep_curl
}
