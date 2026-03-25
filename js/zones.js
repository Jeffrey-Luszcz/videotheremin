// Zone geometry & hit-testing
const Zones = (() => {
  const PITCH_WIDTH_RATIO = 0.15;   // 15% of width for each pitch zone
  const VOLUME_HEIGHT_RATIO = 0.15; // 15% of height for volume zone

  const MIN_FREQ = 65;
  const MAX_FREQ = 3000;

  // Returns zone info for a given position (pixel coordinates on canvas)
  function getZone(x, y, canvasWidth, canvasHeight) {
    const leftPitchEnd = canvasWidth * PITCH_WIDTH_RATIO;
    const rightPitchStart = canvasWidth * (1 - PITCH_WIDTH_RATIO);

    // Check left pitch zone
    if (x < leftPitchEnd) {
      return { type: 'pitch', value: yToFrequency(y, canvasHeight) };
    }

    // Check right pitch zone
    if (x > rightPitchStart) {
      return { type: 'pitch', value: yToFrequency(y, canvasHeight) };
    }

    return { type: 'none', value: 0 };
  }

  // Volume is based purely on x-position, works anywhere on screen
  function getVolume(x, canvasWidth) {
    const relativeX = Math.max(0, Math.min(1, x / canvasWidth));
    return Math.pow(relativeX, 2);
  }

  // Exponential mapping: bottom = MIN_FREQ, top = MAX_FREQ
  function yToFrequency(y, canvasHeight) {
    const normalizedY = 1 - (y / canvasHeight); // 0 at bottom, 1 at top
    const clamped = Math.max(0, Math.min(1, normalizedY));
    // Exponential interpolation for musical feel
    return MIN_FREQ * Math.pow(MAX_FREQ / MIN_FREQ, clamped);
  }

  // Inverse: frequency → Y pixel position
  function frequencyToY(freq, canvasHeight) {
    const clamped = Math.max(MIN_FREQ, Math.min(MAX_FREQ, freq));
    const normalizedY = Math.log(clamped / MIN_FREQ) / Math.log(MAX_FREQ / MIN_FREQ);
    return (1 - normalizedY) * canvasHeight;
  }

  // Get zone rectangles for drawing overlays
  function getZoneRects(canvasWidth, canvasHeight) {
    const leftPitchEnd = canvasWidth * PITCH_WIDTH_RATIO;
    const rightPitchStart = canvasWidth * (1 - PITCH_WIDTH_RATIO);
    const volumeTop = canvasHeight * (1 - VOLUME_HEIGHT_RATIO);

    return {
      leftPitch: { x: 0, y: 0, w: leftPitchEnd, h: volumeTop },
      rightPitch: { x: rightPitchStart, y: 0, w: canvasWidth - rightPitchStart, h: volumeTop },
      volume: { x: 0, y: volumeTop, w: canvasWidth, h: canvasHeight - volumeTop }
    };
  }

  return { getZone, getVolume, yToFrequency, frequencyToY, getZoneRects, PITCH_WIDTH_RATIO, VOLUME_HEIGHT_RATIO };
})();
