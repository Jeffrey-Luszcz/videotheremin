// Audio engine — Web Audio API oscillator with smooth transitions
const AudioEngine = (() => {
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let isInitialized = false;

  const SMOOTHING_TIME = 0.05; // seconds for parameter transitions

  function initAudio() {
    if (isInitialized) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    isInitialized = true;
  }

  function setFrequency(hz) {
    if (!isInitialized) return;
    const clamped = Math.max(65, Math.min(3000, hz));
    oscillator.frequency.setTargetAtTime(clamped, audioCtx.currentTime, SMOOTHING_TIME);
  }

  function setVolume(level) {
    if (!isInitialized) return;
    const clamped = Math.max(0, Math.min(1, level));
    gainNode.gain.setTargetAtTime(clamped, audioCtx.currentTime, SMOOTHING_TIME);
  }

  function mute() {
    if (!isInitialized) return;
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, SMOOTHING_TIME);
  }

  function isReady() {
    return isInitialized;
  }

  return { initAudio, setFrequency, setVolume, mute, isReady };
})();
