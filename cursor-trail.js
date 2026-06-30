// cursor-trail.js
// ── Swap images: edit the IMAGES array below ─────────────────────────────────
const IMAGES = [
  'images/cursor/smiley1.svg',
  'images/cursor/smiley2.svg',
  'images/cursor/smiley3.svg',
  'images/cursor/xoaytron.svg',
  'images/cursor/100%25.svg',
  'images/cursor/15k.svg',
  'images/cursor/tickey.svg',
  'images/cursor/trafficsign1.svg',
  'images/cursor/trafficsign2.svg',
  'images/cursor/trafficsign3.svg',
];

// ── Tune behaviour here ───────────────────────────────────────────────────────
const MIN_DISTANCE   = 90;   // px the cursor must travel before a new drop
const FADE_DURATION  = 900;  // ms: how long each image takes to fade out
const MAX_ELEMENTS   = 18;   // max images on-screen at once (oldest recycled)
const IMAGE_SIZE     = 80;   // px width of each dropped image
const ROTATION_RANGE = 15;   // ± degrees of random rotation per drop
const DRIFT_X_RANGE  = 18;   // ± px random horizontal drift during fade
const DRIFT_Y        = -22;  // px upward drift during fade (negative = up)
const DRIFT_Y_RANGE  = 12;   // ± px variance on the upward drift
const SCALE_END      = 1.35; // scale multiplier at end of fade (slight grow)
// ─────────────────────────────────────────────────────────────────────────────

(function () {
  // Inject the minimal CSS this module needs
  var style = document.createElement('style');
  style.textContent = [
    '#cursor-trail-overlay {',
    '  position: fixed;',
    '  inset: 0;',
    '  pointer-events: none;',
    '  z-index: 99999;',
    '  overflow: hidden;',
    '}',
    '.ct-img {',
    '  position: absolute;',
    '  top: 0;',
    '  left: 0;',
    '  width: ' + IMAGE_SIZE + 'px;',
    '  height: auto;',
    '  will-change: transform, opacity;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  // Resolve image paths relative to this script file, not the page that loads it
  var _scriptSrc = (document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })()).src;
  var _base = _scriptSrc.replace(/\/[^\/]*$/, '/'); // strip filename, keep trailing /

  // Create the full-screen overlay
  var overlay = document.createElement('div');
  overlay.id = 'cursor-trail-overlay';
  document.body.appendChild(overlay);

  var lastX      = 0;
  var lastY      = 0;
  var imageIndex = 0;
  var active     = []; // ordered list of live elements for recycling

  function rand(range) {
    return (Math.random() * 2 - 1) * range;
  }

  function drop(x, y) {
    // Recycle oldest element if we're at the cap
    if (active.length >= MAX_ELEMENTS) {
      var oldest = active.shift();
      if (oldest.parentNode) oldest.parentNode.removeChild(oldest);
    }

    var img = document.createElement('img');
    img.className = 'ct-img';
    img.src = _base + IMAGES[imageIndex % IMAGES.length];
    imageIndex++;

    var rotation = rand(ROTATION_RANGE);
    var spawnOffX = rand(10); // tiny jitter on spawn position
    var spawnOffY = rand(10);
    var driftX    = rand(DRIFT_X_RANGE);
    var driftY    = DRIFT_Y + rand(DRIFT_Y_RANGE);

    // Translate so the image centre sits on the cursor
    var startX = x - IMAGE_SIZE / 2 + spawnOffX;
    var startY = y - IMAGE_SIZE / 2 + spawnOffY;

    // Set initial state with no transition
    img.style.opacity   = '1';
    img.style.transform = 'translate(' + startX + 'px, ' + startY + 'px)'
                        + ' rotate(' + rotation + 'deg)'
                        + ' scale(1)';
    img.style.transition = 'none';

    overlay.appendChild(img);
    active.push(img);

    // Force a reflow so the browser paints the start state
    img.getBoundingClientRect();

    // Activate the transition to the end state
    img.style.transition = 'transform ' + FADE_DURATION + 'ms ease-out';
    img.style.transform  = 'translate(' + (startX + driftX) + 'px, ' + (startY + driftY) + 'px)'
                         + ' rotate(' + rotation + 'deg)'
                         + ' scale(' + SCALE_END + ')';

    // Clean up from DOM once the animation finishes
    setTimeout(function () {
      if (img.parentNode) img.parentNode.removeChild(img);
      var idx = active.indexOf(img);
      if (idx !== -1) active.splice(idx, 1);
    }, FADE_DURATION);
  }

  document.addEventListener('mousemove', function (e) {
    var dx   = e.clientX - lastX;
    var dy   = e.clientY - lastY;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist >= MIN_DISTANCE) {
      lastX = e.clientX;
      lastY = e.clientY;
      drop(e.clientX, e.clientY);
    }
  });
})();
