const USER_MEDIA_CONSTRAINTS = {
  audio: {
    mandatory: {
      googEchoCancellation: 'true',
      googAutoGainControl: 'false',
      googNoiseSuppression: 'true',
      googHighpassFilter: 'true',
    },
    optional: [],
  },
}
const FFT_SIZE = 2048
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export { USER_MEDIA_CONSTRAINTS, FFT_SIZE, NOTES }
