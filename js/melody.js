// Auto-play melody triggered by two-hands-in-middle gesture
const Melody = (() => {
  // Note frequencies (C4 major scale)
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23;
  const G4 = 392.00, A4 = 440.00;

  // Twinkle Twinkle Little Star — [frequency, duration in beats]
  const TUNE = [
    [C4,1],[C4,1],[G4,1],[G4,1],[A4,1],[A4,1],[G4,2],
    [F4,1],[F4,1],[E4,1],[E4,1],[D4,1],[D4,1],[C4,2],
    [G4,1],[G4,1],[F4,1],[F4,1],[E4,1],[E4,1],[D4,2],
    [G4,1],[G4,1],[F4,1],[F4,1],[E4,1],[E4,1],[D4,2],
    [C4,1],[C4,1],[G4,1],[G4,1],[A4,1],[A4,1],[G4,2],
    [F4,1],[F4,1],[E4,1],[E4,1],[D4,1],[D4,1],[C4,2],
  ];

  const BEAT_MS = 500; // milliseconds per beat

  let active = false;
  let waiting = false; // waiting for first touch before advancing
  let startTime = 0;
  let totalBeats = 0;

  // Precompute cumulative beat offsets
  const noteStarts = [];
  (function () {
    let t = 0;
    for (const [, dur] of TUNE) {
      noteStarts.push(t);
      t += dur;
    }
    totalBeats = t;
  })();

  function start() {
    if (active) return;
    active = true;
    waiting = true; // show first note but don't advance until touched
  }

  function stop() {
    active = false;
    waiting = false;
  }

  // Called when a hand touches the ball — begins playback
  function onTouch() {
    if (!waiting) return;
    waiting = false;
    startTime = performance.now();
  }

  function isActive() {
    return active;
  }

  function isWaiting() {
    return waiting;
  }

  // Returns the current note's frequency, or null if melody finished
  function getCurrentFrequency() {
    if (!active) return null;
    // While waiting, show the first note
    if (waiting) return TUNE[0][0];

    const elapsed = performance.now() - startTime;
    const currentBeat = elapsed / BEAT_MS;

    if (currentBeat >= totalBeats) {
      // Loop the melody
      startTime = performance.now();
      return TUNE[0][0];
    }

    // Find which note we're on
    for (let i = TUNE.length - 1; i >= 0; i--) {
      if (currentBeat >= noteStarts[i]) {
        return TUNE[i][0];
      }
    }
    return TUNE[0][0];
  }

  return { start, stop, onTouch, isActive, isWaiting, getCurrentFrequency };
})();
