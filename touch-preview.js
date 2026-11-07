/* Touch screens have no hover, so press and hold (or slide a finger) over a homepage
   image to see its rollover photo and title. A quick tap still opens the page. */
(function () {
  if (!window.matchMedia('(hover: none)').matches) return;

  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  if (!tiles.length) return;

  /* Load each rollover photo shortly before its tile scrolls into view */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var hover = entry.target.querySelector('img.hover');
        if (hover) hover.loading = 'eager';
        io.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px' });
    tiles.forEach(function (tile) { io.observe(tile); });
  }

  var HOLD_MS = 180;   /* how long a finger rests before the preview appears */
  var MOVE_PX = 10;    /* moving farther than this first means the person is scrolling */
  var timer = null, startX = 0, startY = 0, active = null, held = false;

  function setActive(tile) {
    if (active === tile) return;
    if (active) active.classList.remove('is-touched');
    active = tile;
    if (active) active.classList.add('is-touched');
  }

  function tileAt(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest('.tile') : null;
  }

  document.addEventListener('touchstart', function (e) {
    held = false;
    var tile = e.target.closest ? e.target.closest('.tile') : null;
    clearTimeout(timer);
    if (!tile) return;
    var p = e.touches[0];
    startX = p.clientX;
    startY = p.clientY;
    timer = setTimeout(function () { held = true; setActive(tile); }, HOLD_MS);
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    var p = e.touches[0];
    if (!held) {
      if (Math.abs(p.clientX - startX) > MOVE_PX || Math.abs(p.clientY - startY) > MOVE_PX) {
        clearTimeout(timer);   /* the person is scrolling, so no preview */
      }
      return;
    }
    e.preventDefault();        /* keep the page still while previewing */
    setActive(tileAt(p.clientX, p.clientY));
  }, { passive: false });

  function end() {
    clearTimeout(timer);
    setActive(null);
  }
  document.addEventListener('touchend', end);
  document.addEventListener('touchcancel', end);

  /* Lifting a finger after a preview should not open the page */
  document.addEventListener('click', function (e) {
    if (held) { e.preventDefault(); held = false; }
  }, true);

  /* Stop the phone's own press-and-hold menu on the images */
  document.addEventListener('contextmenu', function (e) {
    if (e.target.closest && e.target.closest('.tile')) e.preventDefault();
  });
})();
