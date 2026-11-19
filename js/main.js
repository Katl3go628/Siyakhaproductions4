// Mobile menu, footer year, scroll fade-in and home hero player. No dependencies.
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

  // Home hero: play the logo video, then load each photo as the slideshow approaches it.
  var hero = document.getElementById('hero');
  if (hero) {
    var video = hero.querySelector('video');
    var slides = hero.querySelectorAll('.slide');
    var idx = 0, timer = null;
    var setLight = function (on) {
      hero.classList.toggle('is-video', on);
      document.body.classList.toggle('hero-light', on);
    };
    var loadSlide = function (n) {
      var slide = slides[n];
      if (!slide) return;
      var source = slide.getAttribute('data-src');
      if (source && slide.getAttribute('data-loaded') !== 'true') {
        slide.src = source;
        slide.setAttribute('data-loaded', 'true');
        slide.decoding = 'async';
      }
    };
    var showSlide = function (n) {
      if (n >= 0) loadSlide(n);
      for (var k = 0; k < slides.length; k++) slides[k].classList.toggle('on', k === n);
    };
    var preloadNextSlide = function () {
      if (idx + 1 < slides.length) loadSlide(idx + 1);
    };
    var schedule = function () {
      clearTimeout(timer);
      preloadNextSlide();
      timer = setTimeout(next, 4500);
    };
    var startPhotos = function () {
      if (video) video.classList.remove('on');
      setLight(false);
      idx = 0;
      showSlide(0);
      schedule();
    };
    var showVideo = function () {
      showSlide(-1);
      setLight(true);
      if (!video) { startPhotos(); return; }
      video.currentTime = 0;
      video.classList.add('on');
      var playback = video.play();
      if (playback && playback.catch) playback.catch(startPhotos);
    };
    var next = function () {
      idx++;
      if (idx >= slides.length) showVideo();
      else { showSlide(idx); schedule(); }
    };
    if (video) {
      video.addEventListener('ended', startPhotos);
      video.addEventListener('error', startPhotos);
      showVideo();
    } else startPhotos();
  }
})();
