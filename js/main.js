// Main entry point — wire everything together
(() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const video = document.getElementById('video');
  const startBtn = document.getElementById('startBtn');
  const overlay = document.getElementById('overlay');
  const status = document.getElementById('status');

  let currentFrequency = null;
  let currentVolume = null;

  startBtn.addEventListener('click', async () => {
    status.textContent = 'Initializing...';
    startBtn.disabled = true;

    try {
      // Init audio (must be triggered by user gesture)
      AudioEngine.initAudio();

      // Init hand tracking
      HandTracking.init(video, onHandResults);
      HandTracking.start();

      status.textContent = 'Loading hand tracking model...';

      // Hide overlay after a brief delay to let camera start
      setTimeout(() => {
        overlay.classList.add('hidden');
      }, 1500);

    } catch (err) {
      status.textContent = 'Error: ' + err.message;
      startBtn.disabled = false;
      console.error(err);
    }
  });

  function onHandResults(image, handData) {
    // Set canvas size to match video
    if (canvas.width !== image.width || canvas.height !== image.height) {
      canvas.width = image.width;
      canvas.height = image.height;
    }

    // Draw the frame (mirrored video + zones + hands)
    Drawing.drawFrame(ctx, canvas, image, handData);

    // Process hand positions for audio control
    processHands(handData);
  }

  function processHands(handData) {
    if (handData.length === 0) {
      AudioEngine.mute();
      Melody.stop();
      currentFrequency = null;
      currentVolume = null;
      return;
    }

    // Map all hands to pixel coordinates
    const hands = handData.map(hand => {
      const mirroredX = 1 - hand.palmX;
      return {
        pixelX: mirroredX * canvas.width,
        pixelY: hand.palmY * canvas.height,
      };
    });

    // Two hands in the middle of the screen starts the melody tutor
    const middleLeft = canvas.width * 0.2;
    const middleRight = canvas.width * 0.8;
    const twoHandsInMiddle = hands.length >= 2 &&
      hands.every(h => h.pixelX > middleLeft && h.pixelX < middleRight);

    if (twoHandsInMiddle) {
      Melody.start();
    }
    // Melody keeps running once started — only stops when all hands disappear

    // Melody mode: only play when a hand is over a blue ball on either side
    if (Melody.isActive()) {
      const freq = Melody.getCurrentFrequency();
      const ballPos = Drawing.getMelodyBallPositions(canvas.width, canvas.height);

      if (freq && ballPos) {
        const handOnBall = hands.some(h => {
          for (const ball of [ballPos.left, ballPos.right]) {
            const dx = h.pixelX - ball.x;
            const dy = h.pixelY - ball.y;
            if (Math.sqrt(dx * dx + dy * dy) < ballPos.hitRadius) return true;
          }
          return false;
        });

        if (handOnBall) {
          // First touch starts the melody advancing
          if (Melody.isWaiting()) {
            Melody.onTouch();
          }
          AudioEngine.setFrequency(freq);
          AudioEngine.setVolume(0.5);
          currentFrequency = freq;
          currentVolume = 0.5;
        } else {
          AudioEngine.mute();
          currentFrequency = null;
          currentVolume = null;
        }
      }
      return;
    }

    // Normal mode: higher hand = pitch, lower hand = volume
    hands.sort((a, b) => a.pixelY - b.pixelY);

    const pitchHand = hands[0];
    const volumeHand = hands.length > 1 ? hands[1] : null;

    // Pitch tracks y-position anywhere on screen
    const freq = Zones.yToFrequency(pitchHand.pixelY, canvas.height);
    AudioEngine.setFrequency(freq);
    currentFrequency = freq;

    // Volume from second hand, or default to 50%
    if (volumeHand) {
      const vol = Zones.getVolume(volumeHand.pixelX, canvas.width);
      AudioEngine.setVolume(vol);
      currentVolume = vol;
    } else {
      AudioEngine.setVolume(0.5);
      currentVolume = 0.5;
    }
  }
})();
