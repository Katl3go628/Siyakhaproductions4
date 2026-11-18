// Running specials promotion: image, countdown and ticker, with automatic start and expiry.
// Isolated: delete this file, css/promo.css, the #promo-mount div and the two tags that load them to remove it.
(function () {
  var PROMO = {
    start: '2026-11-18',    // first day shown (South African time)
    expiry: '2027-01-31',   // last day shown, inclusive (South African time)
    image: 'assets/images/promo-specials-1400.jpg',
    image700: 'assets/images/promo-specials-700.jpg',
    alt: 'Limited-time printing specials from Siyakha Productions: pull-up banners R1,200, 500 double-sided business cards R300, 1,000 single-sided A5 flyers R999. All prices exclude VAT.',
    ticker: [
      '\uD83D\uDD25 RUNNING SPECIALS NOW AVAILABLE!',
      'Pull-Up Banners \u2014 R1,200 (Excl. VAT)',
      '500 Double-Sided Business Cards \u2014 R300 (Excl. VAT)',
      '1,000 Single-Sided A5 Flyers \u2014 R999 (Excl. VAT)',
      'LIMITED-TIME PROMOTIONAL OFFERS!',
      'ORDER NOW BEFORE THE SPECIAL EXPIRES!'
    ],
    offers: [
      { value: 'promo-pull-up', label: 'Running special: Pull-up banner - R1,200 (excl. VAT)' },
      { value: 'promo-business-cards', label: 'Running special: 500 double-sided business cards - R300 (excl. VAT)' },
      { value: 'promo-flyers', label: 'Running special: 1,000 single-sided A5 flyers - R999 (excl. VAT)' }
    ]
  };

  var mount = document.getElementById('promo-mount');
  var enquirySelect = document.getElementById('division');

  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function validDate(s) {
    if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
  }
  // Today's date in South Africa as YYYY-MM-DD.
  function todaySA() {
    var parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    var o = {};
    for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
    return o.year + '-' + o.month + '-' + o.day;
  }
  function isLive() {
    if (!validDate(PROMO.start) || !validDate(PROMO.expiry) || PROMO.start > PROMO.expiry) return false;
    var t = todaySA();
    return t >= PROMO.start && t <= PROMO.expiry;
  }
  function expiryTime() {
    return new Date(PROMO.expiry + 'T00:00:00+02:00').getTime() + 86400000;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function group(hidden) {
    var g = el('div', 'promo-ticker-group');
    if (hidden) g.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < PROMO.ticker.length; i++) g.appendChild(el('span', 'promo-ticker-item', PROMO.ticker[i]));
    return g;
  }

  function updateOfferOptions(live) {
    if (!enquirySelect) return;
    var existing = document.getElementById('promo-offer-options');
    if (!live) {
      if (existing) existing.remove();
      if (enquirySelect.value.indexOf('promo-') === 0) enquirySelect.value = '';
      return;
    }
    if (existing) return;
    var group = el('optgroup');
    group.id = 'promo-offer-options';
    group.label = 'Running specials (until 31 January 2027)';
    for (var i = 0; i < PROMO.offers.length; i++) {
      var option = el('option', null, PROMO.offers[i].label);
      option.value = PROMO.offers[i].value;
      group.appendChild(option);
    }
    enquirySelect.appendChild(group);
    var params = new URLSearchParams(window.location.search);
    var requested = params.get('special');
    for (var j = 0; j < PROMO.offers.length; j++) {
      if (PROMO.offers[j].value === requested) {
        enquirySelect.value = requested;
        break;
      }
    }
  }

  var section = null;
  var countdownValues = {};
  var closeButton = null;
  var inquireButton = null;
  var previousOverflow = '';
  function closePopup() {
    if (!section || !section.classList.contains('promo-popup-open')) return;
    section.classList.remove('promo-popup-open');
    section.removeAttribute('role');
    section.removeAttribute('aria-modal');
    section.removeAttribute('tabindex');
    document.body.style.overflow = previousOverflow;
    if (inquireButton) inquireButton.focus();
  }
  function updateCountdown() {
    if (!section) return;
    var remaining = Math.max(0, expiryTime() - Date.now());
    if (remaining === 0) {
      update();
      return;
    }
    var totalSeconds = Math.floor(remaining / 1000);
    var values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };
    Object.keys(values).forEach(function (unit) {
      countdownValues[unit].textContent = String(values[unit]).padStart(2, '0');
    });
  }
  function build() {
    section = el('section', 'promo');
    section.setAttribute('aria-labelledby', 'promo-title');
    section.classList.add('promo-popup-open');
    section.setAttribute('role', 'dialog');
    section.setAttribute('aria-modal', 'true');
    section.setAttribute('tabindex', '-1');
    var wrap = el('div', 'wrap');
    var frame = el('div', 'promo-frame');

    var h = el('h2', 'promo-sr', 'Limited-time printing specials');
    h.id = 'promo-title';
    frame.appendChild(h);

    closeButton = el('button', 'promo-close', 'Close');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close promotion');
    closeButton.addEventListener('click', closePopup);
    frame.appendChild(closeButton);

    var img = el('img');
    img.src = PROMO.image;
    img.srcset = PROMO.image700 + ' 700w, ' + PROMO.image + ' 1400w';
    img.sizes = '(min-width: 860px) 800px, 100vw';
    img.width = 1400; img.height = 1400;
    img.alt = PROMO.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    frame.appendChild(img);

    var countdown = el('div', 'promo-countdown');
    countdown.appendChild(el('p', 'promo-countdown-title', 'Hurry, this special ends in:'));
    var units = [
      ['days', 'Days'],
      ['hours', 'Hours'],
      ['minutes', 'Minutes'],
      ['seconds', 'Seconds']
    ];
    for (var i = 0; i < units.length; i++) {
      var unit = el('span', 'promo-countdown-unit');
      countdownValues[units[i][0]] = el('strong', 'promo-countdown-value', '00');
      unit.appendChild(countdownValues[units[i][0]]);
      unit.appendChild(el('small', null, units[i][1]));
      countdown.appendChild(unit);
    }
    frame.appendChild(countdown);
    frame.appendChild(el('p', 'promo-date-range', 'Starts 18 November 2026 and ends 31 January 2027.'));

    var bar = el('div', 'promo-ticker');
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Promotional announcements');
    bar.appendChild(el('div', 'promo-ticker-label', 'Specials'));
    var view = el('div', 'promo-ticker-view');
    var track = el('div', 'promo-ticker-track');
    track.appendChild(group(false));
    track.appendChild(group(true));   // second copy makes the loop seamless
    view.appendChild(track);
    bar.appendChild(view);
    frame.appendChild(bar);

    inquireButton = el('a', 'btn promo-inquire', 'Enquire now');
    inquireButton.href = 'contact.html?division=print&special=promo-pull-up#enquiry-form';
    frame.appendChild(inquireButton);

    wrap.appendChild(frame);
    section.appendChild(wrap);
    mount.appendChild(section);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.focus();
    section.addEventListener('click', function (event) {
      if (event.target === section) closePopup();
    });
    document.addEventListener('keydown', function (event) {
      if (!section || !section.classList.contains('promo-popup-open')) return;
      if (event.key === 'Escape') closePopup();
      if (event.key === 'Tab' && event.shiftKey && document.activeElement === closeButton) {
        event.preventDefault();
        inquireButton.focus();
      } else if (event.key === 'Tab' && !event.shiftKey && document.activeElement === inquireButton) {
        event.preventDefault();
        closeButton.focus();
      }
    });

    // Constant scroll speed (about 70px per second) whatever the text length.
    function setSpeed() {
      var first = track.firstChild;
      if (first && first.offsetWidth) track.style.setProperty('--promo-duration', Math.max(15, first.offsetWidth / 70) + 's');
    }
    setSpeed();
    window.addEventListener('load', setSpeed);
  }

  function update() {
    var live = isLive();
    updateOfferOptions(live);
    if (live && mount && !section) build();
    if (!live && section) {
      if (section.classList.contains('promo-popup-open')) {
        section.classList.remove('promo-popup-open');
        document.body.style.overflow = previousOverflow;
      }
      section.remove();
      section = null;
    }
    updateCountdown();
  }

  update();
  setInterval(update, 60000);
  setInterval(updateCountdown, 1000);
  if (isLive()) setTimeout(update, Math.max(0, expiryTime() - Date.now()));
})();
