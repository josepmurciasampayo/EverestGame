'use strict'

import { USER_MEDIA_CONSTRAINTS, FFT_SIZE } from './constants.js'
import { autoCorrelate } from './algorithm.js'
import getDataFromFrequency from './getDataFromFrequency.js'
export const freelizer = async () => {
  let rafID
  let audioContext
  let analyser
  let callbacks = []
  let source
  const init = async () => {
    const stream = await navigator.mediaDevices.getUserMedia(
      USER_MEDIA_CONSTRAINTS
    )
    audioContext = new AudioContext()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = FFT_SIZE
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser)
  }

  const update = () => {
    const buffer = new Float32Array(FFT_SIZE)
    analyser.getFloatTimeDomainData(buffer)
    const frequency = autoCorrelate(buffer, audioContext.sampleRate)
    callbacks.forEach((fn) =>
      fn(frequency ? getDataFromFrequency(frequency) : {})
    )
    rafID = requestAnimationFrame(update)
  }

  await init()

  return {
    start: () => {update(); console.log(rafID)},
    stop: () => {cancelAnimationFrame(rafID); console.log(rafID);},
    subscribe: (fn) => (callbacks = [...callbacks, fn]),
    unsubscribe: (fn) => (callbacks = callbacks.filter((el) => el !== fn)),
    getSource: () => source,
  }
}
