(function () {
  'use strict';

  // Keep this list in visual age order. Replace paths here to use another sequence.
  var FRAME_FILES = [
    'assets/frames/01.JPG', 'assets/frames/02.JPG',
    'assets/frames/03.JPG', 'assets/frames/04.JPG',
    'assets/frames/05.JPG', 'assets/frames/06.JPG',
    'assets/frames/07.JPG', 'assets/frames/08.JPG'
  ];
  var canvas = document.getElementById('face-canvas');
  var context = canvas.getContext('2d');
  var images = new Array(FRAME_FILES.length);
  var ready = new Array(FRAME_FILES.length).fill(false);
  var targetProgress = 0;
  var renderedProgress = 0;
  var firstFrameDrawn = false;
  var rafStarted = false;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = 1;
  var canvasWidth = 0;
  var canvasHeight = 0;
  var imageGutter = 0;

  function stageHeight() {
    return canvasHeight || document.documentElement.clientHeight;
  }

  function progressFromScroll() {
    var documentBottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    var stableTravel = Math.max(1, document.documentElement.scrollHeight - stageHeight());
    if (window.scrollY <= 0) return 0;
    if (window.scrollY >= documentBottom) return 1;
    return Math.max(0, Math.min(1, window.scrollY / stableTravel));
  }

  function sizeCanvas() {
    var box = canvas.getBoundingClientRect();
    var nextWidth = box.width;
    var nextHeight = box.height;
    if (!nextWidth || !nextHeight) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var dimensionsChanged = nextWidth !== canvasWidth || nextHeight !== canvasHeight;
    canvasWidth = nextWidth;
    canvasHeight = nextHeight;
    // Mirror --image-gutter: clamp(16px, 4vw, 48px) in resolved canvas pixels.
    imageGutter = Math.min(48, Math.max(16, canvasWidth * 0.04));
    if (dimensionsChanged || canvas.width !== Math.round(canvasWidth * dpr) || canvas.height !== Math.round(canvasHeight * dpr)) {
      canvas.width = Math.max(1, Math.round(canvasWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvasHeight * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    draw(renderedProgress);
  }

  function drawImageContained(image, alpha) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    var width = canvasWidth;
    var height = canvasHeight;
    var availableWidth = Math.max(0, width - (imageGutter * 2));
    var scale = Math.min(availableWidth / image.naturalWidth, height / image.naturalHeight);
    var drawWidth = image.naturalWidth * scale;
    var drawHeight = image.naturalHeight * scale;
    context.globalAlpha = alpha;
    context.drawImage(image, imageGutter + (availableWidth - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function draw(progress) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    var scaled = progress * (FRAME_FILES.length - 1);
    var lower = Math.floor(scaled);
    var upper = Math.min(FRAME_FILES.length - 1, lower + 1);
    var blend = scaled - lower;
    if (!ready[lower]) {
      for (var i = lower - 1; i >= 0; i--) if (ready[i]) { lower = i; break; }
    }
    if (!ready[upper]) upper = lower;
    drawImageContained(images[lower], 1);
    if (upper !== lower) drawImageContained(images[upper], blend);
    context.globalAlpha = 1;
  }

  function render() {
    var distance = targetProgress - renderedProgress;
    renderedProgress = reducedMotion ? targetProgress : renderedProgress + distance * 0.14;
    if (Math.abs(distance) < 0.0001) renderedProgress = targetProgress;
    draw(renderedProgress);
    requestAnimationFrame(render);
  }

  function startRenderLoop() {
    if (rafStarted) return;
    rafStarted = true;
    requestAnimationFrame(render);
  }

  function preload() {
    var loaded = 0;
    FRAME_FILES.forEach(function (source, index) {
      var image = new Image();
      images[index] = image;
      image.onload = function () {
        ready[index] = true;
        loaded += 1;
        if (!firstFrameDrawn && index === 0) {
          firstFrameDrawn = true;
          draw(0);
        }
        if (loaded === FRAME_FILES.length) {
          draw(renderedProgress);
          startRenderLoop();
        }
      };
      image.onerror = function () {
        loaded += 1;
        if (loaded === FRAME_FILES.length) {
          draw(renderedProgress);
          startRenderLoop();
        }
      };
      image.src = source;
    });
  }

  window.addEventListener('scroll', function () { targetProgress = progressFromScroll(); }, { passive: true });
  window.addEventListener('resize', sizeCanvas, { passive: true });
  window.addEventListener('orientationchange', sizeCanvas, { passive: true });
  sizeCanvas();
  targetProgress = progressFromScroll();
  preload();
}());
