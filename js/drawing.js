// Canvas rendering — mirrored video, zone overlays, hand landmarks
const Drawing = (() => {
  const PITCH_ZONE_COLOR = 'rgba(144, 238, 144, 0.25)';  // light green
  const VOLUME_ZONE_COLOR = 'rgba(135, 206, 250, 0.25)'; // light blue
  const LANDMARK_COLOR = '#FF0000';
  const CONNECTION_COLOR = 'rgba(255, 0, 0, 0.6)';
  const LANDMARK_RADIUS = 5;

  const MELODY_BALL_RADIUS = 30;
  const MELODY_HIT_RADIUS = 40; // hand must be close to the ball

  function drawFrame(ctx, canvas, videoImage, handData) {
    const w = canvas.width;
    const h = canvas.height;

    // Draw mirrored video
    ctx.save();
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoImage, 0, 0, w, h);
    ctx.restore();

    // Draw zone overlays
    drawZones(ctx, w, h);

    // Draw hand landmarks
    for (const hand of handData) {
      drawHand(ctx, hand.landmarks, w, h);
    }

    // During melody mode, draw blue balls in both pitch zones
    if (Melody.isActive()) {
      drawMelodyBalls(ctx, w, h);
    }
  }

  // Returns both ball positions for hit testing
  function getMelodyBallPositions(canvasWidth, canvasHeight) {
    const freq = Melody.getCurrentFrequency();
    if (!freq) return null;
    const ballY = Zones.frequencyToY(freq, canvasHeight);
    const leftX = canvasWidth * Zones.PITCH_WIDTH_RATIO / 2;
    const rightX = canvasWidth * (1 - Zones.PITCH_WIDTH_RATIO / 2);
    return {
      left: { x: leftX, y: ballY },
      right: { x: rightX, y: ballY },
      hitRadius: MELODY_HIT_RADIUS,
    };
  }

  function drawMelodyBalls(ctx, w, h) {
    const pos = getMelodyBallPositions(w, h);
    if (!pos) return;

    for (const ball of [pos.left, pos.right]) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, MELODY_BALL_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 120, 255, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  function drawZones(ctx, w, h) {
    const rects = Zones.getZoneRects(w, h);

    // Left pitch zone (green)
    ctx.fillStyle = PITCH_ZONE_COLOR;
    ctx.fillRect(rects.leftPitch.x, rects.leftPitch.y, rects.leftPitch.w, rects.leftPitch.h);

    // Right pitch zone (green)
    ctx.fillRect(rects.rightPitch.x, rects.rightPitch.y, rects.rightPitch.w, rects.rightPitch.h);

    // Volume zone (blue)
    ctx.fillStyle = VOLUME_ZONE_COLOR;
    ctx.fillRect(rects.volume.x, rects.volume.y, rects.volume.w, rects.volume.h);

    // Zone labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';

    ctx.save();
    // Left pitch label (rotated)
    ctx.translate(rects.leftPitch.w / 2, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('♪ PITCH', 0, 0);
    ctx.restore();

    ctx.save();
    // Right pitch label (rotated)
    ctx.translate(rects.rightPitch.x + rects.rightPitch.w / 2, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('♪ PITCH', 0, 0);
    ctx.restore();

    // Volume label
    ctx.fillText('🔊 VOLUME', rects.volume.x + rects.volume.w / 2, rects.volume.y + rects.volume.h / 2 + 5);
  }

  function drawHand(ctx, landmarks, canvasWidth, canvasHeight) {
    // Draw connections
    ctx.strokeStyle = CONNECTION_COLOR;
    ctx.lineWidth = 2;
    for (const [start, end] of HandTracking.HAND_CONNECTIONS) {
      const startPt = landmarks[start];
      const endPt = landmarks[end];
      // Mirror x coordinates to match the mirrored video
      const sx = (1 - startPt.x) * canvasWidth;
      const sy = startPt.y * canvasHeight;
      const ex = (1 - endPt.x) * canvasWidth;
      const ey = endPt.y * canvasHeight;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Draw landmark dots
    ctx.fillStyle = LANDMARK_COLOR;
    for (const lm of landmarks) {
      const x = (1 - lm.x) * canvasWidth;
      const y = lm.y * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, LANDMARK_RADIUS, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  return { drawFrame, getMelodyBallPositions };
})();
