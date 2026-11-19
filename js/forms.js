// Enquiry form: client-side validation + Web3Forms email delivery.
// Web3Forms access keys are public form identifiers, not secret API credentials.
(function () {
  var form = document.getElementById('enquiry-form');
  if (!form) return;
  var status = document.getElementById('form-status');
  var btn = form.querySelector('button[type="submit"]');
  var params = new URLSearchParams(window.location.search);
  var pre = params.get('division');
  var special = params.get('special');
  var matchingSpecial = Array.prototype.some.call(form.division.options, function (option) {
    return option.value === special;
  });
  if (matchingSpecial) form.division.value = special;
  else if (pre === 'sound' || pre === 'print' || pre === 'both' || pre === 'general') form.division.value = pre;

  var rules = {
    name: function (v) { return v.trim() ? '' : 'Enter your full name.'; },
    email: function (v) {
      if (!v.trim()) return 'Enter your email address.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address, for example name@company.com.';
    },
    division: function (v) { return v ? '' : 'Choose which division your enquiry is for.'; },
    message: function (v) { return v.trim().length >= 10 ? '' : 'Enter a message of at least 10 characters.'; }
  };

  function check(name) {
    var field = form.elements[name];
    var msg = rules[name](field.value);
    document.getElementById(name + '-err').textContent = msg;
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return msg === '';
  }
  Object.keys(rules).forEach(function (n) {
    form.elements[n].addEventListener('blur', function () { check(n); });
  });

  function say(text, ok) {
    status.textContent = text;
    status.className = 'status ' + (ok ? 'ok' : 'bad');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var firstBad = null;
    Object.keys(rules).forEach(function (n) {
      if (!check(n) && !firstBad) firstBad = form.elements[n];
    });
    if (firstBad) { firstBad.focus(); return; }
    if (form._honey.value) return; // spam trap: bots fill this in

    // Route only from the fixed select options; never accept a visitor-supplied recipient.
    var accessKeys = {
      general: '7f86f27a-0bd1-4c2a-bef4-6e3e63c0f338',
      sound: '44179350-5a97-4c24-a890-123a5779fd4f',
      print: '44179350-5a97-4c24-a890-123a5779fd4f',
      both: '44179350-5a97-4c24-a890-123a5779fd4f',
      // Running promotional offers are all sales enquiries and go to the Sales inbox.
      'promo-pull-up': '44179350-5a97-4c24-a890-123a5779fd4f',
      'promo-business-cards': '44179350-5a97-4c24-a890-123a5779fd4f',
      'promo-flyers': '44179350-5a97-4c24-a890-123a5779fd4f'
    };
    var selectedDivision = form.division.value;
    var accessKey = accessKeys[selectedDivision];
    if (!accessKey) {
      say('Please choose a valid enquiry type and try again.', false);
      form.division.focus();
      return;
    }

    var fd = new FormData(form);
    fd.set('access_key', accessKey);
    fd.set('division', form.division.options[form.division.selectedIndex].text);
    fd.set('subject', 'New website enquiry - Siyakha Productions');
    fd.set('from_name', 'Siyakha Productions');
    var payload = Object.fromEntries(fd.entries());

    btn.disabled = true; btn.textContent = 'Sending...';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (d) {
          return { ok: r.ok, d: d };
        });
      })
      .then(function (res) {
        if (!res.ok || res.d.success !== true) {
          throw new Error('Web3Forms submission failed');
        }
        form.reset();
        say('Thank you. Your enquiry has been sent.', true);
      })
      .catch(function () {
        say('Your message could not be sent. Please try again, or email or WhatsApp us using the details on this page.', false);
      })
      .then(function () { btn.disabled = false; btn.textContent = 'Send enquiry'; });
  });
})();
