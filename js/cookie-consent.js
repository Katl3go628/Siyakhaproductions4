(function () {
  var STORAGE_KEY = 'siyakha-cookie-consent-v1';
  var categories = ['analytics', 'functional', 'advertising'];
  var preferences = {
    essential: true,
    analytics: false,
    functional: false,
    advertising: false
  };
  var hasChoice = false;
  var banner;
  var dialog;
  var inputs = {};

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function copyPreferences() {
    return {
      essential: true,
      analytics: preferences.analytics,
      functional: preferences.functional,
      advertising: preferences.advertising
    };
  }

  function readPreferences() {
    var stored;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Cookie preferences could not be read from local storage.', error);
      return false;
    }
    if (!stored) return false;

    var parsed;
    try {
      parsed = JSON.parse(stored);
    } catch (error) {
      console.error('Stored cookie preferences could not be parsed.', error);
      return false;
    }
    if (!parsed || parsed.version !== 1 || !parsed.preferences ||
        typeof parsed.preferences.analytics !== 'boolean' ||
        typeof parsed.preferences.functional !== 'boolean' ||
        typeof parsed.preferences.advertising !== 'boolean') return false;

    preferences = copyPreferences();
    preferences.analytics = parsed.preferences.analytics;
    preferences.functional = parsed.preferences.functional;
    preferences.advertising = parsed.preferences.advertising;
    return true;
  }

  function hasConsent(category) {
    if (category === 'essential') return true;
    return categories.indexOf(category) !== -1 && preferences[category] === true;
  }

  function activateConsentedScripts() {
    var stagedScripts = document.querySelectorAll('script[type="text/plain"][data-cookie-category]');
    for (var i = 0; i < stagedScripts.length; i++) {
      var staged = stagedScripts[i];
      if (!hasConsent(staged.getAttribute('data-cookie-category'))) continue;
      var activeScript = document.createElement('script');
      var source = staged.getAttribute('data-cookie-src');
      if (source) {
        activeScript.src = source;
        activeScript.async = true;
      } else {
        activeScript.text = staged.textContent;
      }
      staged.parentNode.replaceChild(activeScript, staged);
    }
  }

  function emitChange() {
    window.dispatchEvent(new CustomEvent('siyakha:consentchange', {
      detail: copyPreferences()
    }));
  }

  function savePreferences(next) {
    preferences = {
      essential: true,
      analytics: next.analytics === true,
      functional: next.functional === true,
      advertising: next.advertising === true
    };
    hasChoice = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        preferences: copyPreferences()
      }));
    } catch (error) {
      console.error('Cookie preferences could not be saved to local storage.', error);
    }
    activateConsentedScripts();
    banner.hidden = true;
    if (dialog.open) dialog.close();
    emitChange();
  }

  function preferenceRow(category, title, description, required) {
    var label = el('label', 'cookie-preference-row');
    var input = el('input');
    input.type = 'checkbox';
    input.checked = required || preferences[category];
    input.disabled = required;
    input.id = 'cookie-preference-' + category;
    var text = el('span', 'cookie-preference-copy');
    text.appendChild(el('strong', null, title));
    text.appendChild(el('small', null, description));
    label.appendChild(input);
    label.appendChild(text);
    inputs[category] = input;
    return label;
  }

  function updateInputs() {
    inputs.essential.checked = true;
    for (var i = 0; i < categories.length; i++) {
      inputs[categories[i]].checked = preferences[categories[i]];
    }
  }

  function openPreferences() {
    updateInputs();
    if (!dialog.open) dialog.showModal();
  }

  function createInterface() {
    banner = el('section', 'cookie-consent-banner');
    banner.hidden = true;
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'cookie-consent-title');
    var message = el('div', 'cookie-consent-message');
    message.appendChild(el('h2', null, 'Your cookie preferences'));
    message.lastChild.id = 'cookie-consent-title';
    message.appendChild(el('p', null, 'Essential storage is always available where needed. Choose whether to allow optional analytics, functional and advertising cookies. You can change your choice later in Cookie preferences.'));
    var policyPage = /\/(privacy-policy|terms-and-conditions|cookie-policy)(\/|\/index\.html)?$/.test(window.location.pathname);
    var policyLink = el('a', null, 'Read our Cookie Policy');
    policyLink.href = (policyPage ? '../' : '') + 'cookie-policy/';
    message.appendChild(policyLink);
    var actions = el('div', 'cookie-consent-actions');
    var settingsButton = el('button', 'btn ghost', 'Cookie settings');
    settingsButton.type = 'button';
    settingsButton.addEventListener('click', openPreferences);
    var rejectButton = el('button', 'btn ghost', 'Reject non-essential');
    rejectButton.type = 'button';
    rejectButton.addEventListener('click', function () {
      savePreferences({ analytics: false, functional: false, advertising: false });
    });
    var acceptButton = el('button', 'btn', 'Accept all');
    acceptButton.type = 'button';
    acceptButton.addEventListener('click', function () {
      savePreferences({ analytics: true, functional: true, advertising: true });
    });
    actions.appendChild(settingsButton);
    actions.appendChild(rejectButton);
    actions.appendChild(acceptButton);
    banner.appendChild(message);
    banner.appendChild(actions);
    document.body.appendChild(banner);

    dialog = el('dialog', 'cookie-preferences-dialog');
    dialog.setAttribute('aria-labelledby', 'cookie-preferences-title');
    var panel = el('div', 'cookie-preferences-panel');
    var heading = el('div', 'cookie-preferences-heading');
    heading.appendChild(el('h2', null, 'Cookie preferences'));
    heading.lastChild.id = 'cookie-preferences-title';
    var closeButton = el('button', 'cookie-preferences-close', 'Close');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close cookie preferences');
    closeButton.addEventListener('click', function () { dialog.close(); });
    heading.appendChild(closeButton);
    panel.appendChild(heading);
    panel.appendChild(el('p', null, 'Essential storage is always enabled. Select the optional cookie categories you agree to use.'));
    panel.appendChild(preferenceRow('essential', 'Essential', 'Required for core site functions and saving your choice.', true));
    panel.appendChild(preferenceRow('analytics', 'Analytics', 'Helps us understand how visitors use the website.', false));
    panel.appendChild(preferenceRow('functional', 'Functional', 'Remembers optional settings and preferences.', false));
    panel.appendChild(preferenceRow('advertising', 'Advertising and marketing', 'Supports campaign measurement or relevant advertising if used.', false));
    var dialogActions = el('div', 'cookie-preferences-actions');
    var cancelButton = el('button', 'btn ghost', 'Cancel');
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', function () { dialog.close(); });
    var rejectAllButton = el('button', 'btn ghost', 'Reject non-essential');
    rejectAllButton.type = 'button';
    rejectAllButton.addEventListener('click', function () {
      savePreferences({ analytics: false, functional: false, advertising: false });
    });
    var saveButton = el('button', 'btn', 'Save preferences');
    saveButton.type = 'button';
    saveButton.addEventListener('click', function () {
      savePreferences({
        analytics: inputs.analytics.checked,
        functional: inputs.functional.checked,
        advertising: inputs.advertising.checked
      });
    });
    dialogActions.appendChild(cancelButton);
    dialogActions.appendChild(rejectAllButton);
    dialogActions.appendChild(saveButton);
    panel.appendChild(dialogActions);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);

    var triggers = document.querySelectorAll('[data-cookie-preferences]');
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener('click', openPreferences);
    }
  }

  function fixLocalPolicyLinks() {
    if (window.location.protocol !== 'file:') return;
    var links = document.querySelectorAll('a[href]');
    var routePattern = /^((?:\.\.\/)?(?:privacy-policy|terms-and-conditions|cookie-policy))\/?$/;
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      var match = href && href.match(routePattern);
      if (match) links[i].setAttribute('href', match[1] + '/index.html');
    }
  }

  createInterface();
  fixLocalPolicyLinks();
  hasChoice = readPreferences();
  window.SiyakhaCookieConsent = {
    hasConsent: hasConsent,
    getPreferences: copyPreferences,
    openPreferences: openPreferences
  };
  if (hasChoice) {
    banner.hidden = true;
    activateConsentedScripts();
  } else {
    banner.hidden = false;
  }
})();
