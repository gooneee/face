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

  function progressFromScroll() {
    var travel = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.max(0, Math.min(1, window.scrollY / travel));
  }

  function sizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
    canvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(renderedProgress);
  }

  function drawImageContained(image, alpha) {
    if (!image || !image.naturalWidth || !image.naturalHeight) return;
    var width = window.innerWidth;
    var height = window.innerHeight;
    var scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    var drawWidth = image.naturalWidth * scale;
    var drawHeight = image.naturalHeight * scale;
    context.globalAlpha = alpha;
    context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  }

  function draw(progress) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
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
