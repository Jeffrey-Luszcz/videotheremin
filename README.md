# Video Theremin 🎵

A browser-based theremin that uses your webcam and hand tracking to control pitch and volume — no hardware needed! Built with MediaPipe Hands and the Web Audio API.

## Getting Started

1. Open `index.html` in a modern browser (**Chrome recommended**)
   - You can open it directly as a file, or serve it locally:
     ```
     python3 -m http.server 8000
     ```
     Then visit **http://localhost:8000**
2. Click **"Start Camera & Audio"**
3. Your browser will ask for camera permission — click **Allow**
4. Wave your hands in front of the camera to play!

### Enabling Camera Permissions

If the camera doesn't start, check your browser's permission settings:

- **Chrome**: Click the lock/tune icon in the address bar → Site settings → Camera → Allow
- **Edge**: Click the lock icon in the address bar → Permissions → Camera → Allow
- **Firefox**: Click the lock icon in the address bar → Connection secure → More information → Permissions → Camera
- **Safari**: Safari menu → Settings → Websites → Camera → Allow

> **Note:** Camera access requires HTTPS or `localhost`. If opening the file directly (`file://`) doesn't work, use the local server method above.

## How to Play

### One Hand — Pitch Only

Hold **one hand** in front of the camera. Move it **up** for higher pitch and **down** for lower pitch. With a single hand, volume defaults to 50%.

### Two Hands — Pitch + Volume

With **two hands** visible, the **higher hand** (closer to the top of the screen) controls **pitch** and the **lower hand** controls **volume**.

- **Pitch** (higher hand): Move up/down to change frequency (65 Hz – 3000 Hz). Uses exponential mapping for a natural musical feel.
- **Volume** (lower hand): Move left for quieter, right for louder. Volume uses a gradual curve — it stays quiet on the left side and ramps up toward the right.

Both hands work **anywhere on screen** — the green and blue zone overlays are visual guides, but tracking isn't limited to those areas.

### Silence

Remove all hands from view to mute the theremin.

### 🎶 Song Tutor Mode

Want to learn a melody? The built-in tutor will guide you through **"Twinkle Twinkle Little Star"**:

1. Hold **both hands in the middle** of the screen to activate tutor mode
2. Blue balls appear in both pitch zones showing the first note — **they wait for you**
3. Move a hand to touch one of the blue balls to start the melody
4. Follow the blue balls as they move to each note — sound only plays when your hand reaches the ball
5. Remove all hands from view to stop the tutor

## Control Reference

| Control | Hand | Direction | Range |
|---------|------|-----------|-------|
| **Pitch** | Higher hand (or only hand) | Up / Down | 65 Hz – 3000 Hz |
| **Volume** | Lower hand | Left / Right | Silent → Full |
| **Mute** | No hands visible | — | — |
| **Song Tutor** | Both hands in center | — | Activates tutor |

## Tech Stack

- **[MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)** — Real-time hand detection (runs entirely in-browser via CDN)
- **Web Audio API** — Sine wave oscillator with smooth parameter transitions
- **Canvas API** — Mirrored webcam feed with zone overlays and hand visualization

## Project Structure

```
index.html          — Main page
css/style.css       — Styling and layout
js/audio.js         — Web Audio API oscillator engine
js/zones.js         — Control zone geometry and frequency mapping
js/hand-tracking.js — MediaPipe hand detection integration
js/drawing.js       — Canvas rendering (video, zones, hands, melody ball)
js/melody.js        — Song tutor melody sequencer
js/main.js          — App entry point and hand→audio logic
assets/             — Splash screen image
```

## Troubleshooting

### Camera Not Working
- Ensure your browser has camera permissions enabled (see above)
- Try refreshing the page and granting permissions again
- Check if other applications are using the camera
- Use `localhost` or HTTPS — `file://` may not work in all browsers

### No Audio
- Click the **"Start Camera & Audio"** button — browsers require a user gesture to start audio
- Check your system volume and browser audio permissions

### Hand Detection Issues
- Ensure good, even lighting
- Keep hands clearly visible against a non-busy background
- Open or closed hands both work — detection uses the center of gravity of all hand landmarks
- Works best at arm's length from the camera

## Browser Compatibility

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | ✅ |
| Edge 90+ | ✅ |
| Firefox 90+ | ✅ |
| Safari 15+ | ⚠️ Partial |

## License

MIT
