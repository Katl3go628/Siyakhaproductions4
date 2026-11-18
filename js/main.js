 // Mobile menu, footer year, Our work autoplay zoom, scroll fade-in, home hero player. No dependencies.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
        toggle.focus();
      }
    });
  }
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Our work: zoom each photo in turn. Pauses on hover; skipped for reduced motion.
  var grid = document.querySelector('.portfolio .grid');
  var tiles = document.querySelectorAll('.portfolio .zoom');
  if (grid && tiles.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var i = 0, timer = null;
    var clear = function () { for (var k = 0; k < tiles.length; k++) tiles[k].classList.remove('active'); };
    var step = function () { clear(); tiles[i].classList.add('active'); i = (i + 1) % tiles.length; };
    var start = function () { stop(); step(); timer = setInterval(step, 2800); };
    var stop = function () { clearInterval(timer); clear(); };
    grid.addEventListener('mouseenter', stop);
    grid.addEventListener('mouseleave', start);
    start();
  }

  // Gentle fade-up as sections scroll into view. Skipped for reduced motion or old browsers.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var targets = document.querySelectorAll('.intro .wrap > *, .division .wrap > *, .services .cols > div, .portfolio .grid, .why dl, .contact .wrap > *');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    for (var n = 0; n < targets.length; n++) { targets[n].classList.add('reveal'); io.observe(targets[n]); }
  }

  // Home page header sits over the hero, and turns solid once you scroll.
  var header = document.querySelector('.site-header');
  if (header && document.body.classList.contains('home')) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Home hero: logo video first, then photos fade one into the next, then back to the video.
  var hero = document.getElementById('hero');
  if (hero) {
    var video = hero.querySelector('video');
    var slides = hero.querySelectorAll('.slide');
    var idx = 0, timer = null;
    var setLight = function (on) { hero.classList.toggle('is-video', on); document.body.classList.toggle('hero-light', on); };
    var showSlide = function (n) { for (var k = 0; k < slides.length; k++) slides[k].classList.toggle('on', k === n); };
    var schedule = function () { clearTimeout(timer); timer = setTimeout(next, 4500); };
    var startPhotos = function () { video.classList.remove('on'); setLight(false); idx = 0; showSlide(0); schedule(); };
    var showVideo = function () {
      showSlide(-1); setLight(true); video.currentTime = 0; video.classList.add('on');
      var p = video.play(); if (p && p.catch) p.catch(startPhotos);
    };
    var next = function () { idx++; if (idx >= slides.length) showVideo(); else { showSlide(idx); schedule(); } };
    // load the other photos once the page is ready
    window.addEventListener('load', function () {
      for (var k = 0; k < slides.length; k++) if (slides[k].getAttribute('data-src')) slides[k].src = slides[k].getAttribute('data-src');
    });
    if (video) {
      video.addEventListener('ended', startPhotos);
      video.addEventListener('error', startPhotos);
      showVideo();
    }
  }
})();
