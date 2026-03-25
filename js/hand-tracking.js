// Hand tracking integration — MediaPipe Hands
const HandTracking = (() => {
  let hands = null;
  let camera = null;
  let onResultsCallback = null;

  // MediaPipe hand landmark connections for drawing
  const HAND_CONNECTIONS = [
    [0,1],[1,2],[2,3],[3,4],       // thumb
    [0,5],[5,6],[6,7],[7,8],       // index
    [0,9],[9,10],[10,11],[11,12],  // middle
    [0,13],[13,14],[14,15],[15,16],// ring
    [0,17],[17,18],[18,19],[19,20],// pinky
    [5,9],[9,13],[13,17]           // palm
  ];

  function init(videoElement, callback) {
    onResultsCallback = callback;

    hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 1280,
      height: 720
    });
  }

  function start() {
    if (camera) camera.start();
  }

  function onResults(results) {
    const handData = [];

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Centroid of all landmarks — tracks the center of mass of the hand
        let sumX = 0, sumY = 0;
        for (const lm of landmarks) {
          sumX += lm.x;
          sumY += lm.y;
        }
        const count = landmarks.length;
        handData.push({
          palmX: sumX / count, // normalized 0-1
          palmY: sumY / count, // normalized 0-1
          landmarks: landmarks
        });
      }
    }

    if (onResultsCallback) {
      onResultsCallback(results.image, handData);
    }
  }

  return { init, start, HAND_CONNECTIONS };
})();
