// ascii-effect.js — cursor-image mosaic overlay that fades out on hover
(function () {
  var IMAGES = [
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

  var CELL_SIZE = 42;   // px — size of each tiled image
  var FADE_MS   = 900;  // hover fade duration

  // Resolve image paths relative to this script, not the page that loads it
  var _scriptSrc = (document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })()).src;
  var _base = _scriptSrc.replace(/\/[^\/]*$/, '/');

  function buildOverlay(hero) {
    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'overflow:hidden',
      'pointer-events:none',
      'background:#f8f8f7',
      'opacity:1',
      'transition:opacity ' + FADE_MS + 'ms ease',
    ].join(';');

    hero.style.position = 'relative';
    hero.appendChild(overlay);

    function populate() {
      overlay.innerHTML = '';
      var w    = hero.offsetWidth;
      var h    = hero.offsetHeight;
      var cols = Math.ceil(w / CELL_SIZE);
      var rows = Math.ceil(h / CELL_SIZE);
      var idx  = 0;

      // Use a document fragment for a single reflow
      var frag = document.createDocumentFragment();

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var img       = document.createElement('img');
          img.src       = _base + IMAGES[idx % IMAGES.length];
          // slight pseudo-random rotation per cell for organic feel
          var rot       = Math.sin(r * 7.3 + c * 13.1) * 18;
          img.style.cssText = [
            'position:absolute',
            'width:'  + CELL_SIZE + 'px',
            'height:' + CELL_SIZE + 'px',
            'left:'   + (c * CELL_SIZE) + 'px',
            'top:'    + (r * CELL_SIZE) + 'px',
            'object-fit:contain',
            'transform:rotate(' + rot + 'deg)',
          ].join(';');
          frag.appendChild(img);
          idx++;
        }
      }

      overlay.appendChild(frag);
    }

    window.addEventListener('load', populate);

    hero.addEventListener('mouseenter', function () { overlay.style.opacity = '0'; });
    hero.addEventListener('mouseleave', function () { overlay.style.opacity = '1'; });
  }

  document.querySelectorAll('.project-hero').forEach(buildOverlay);
})();
