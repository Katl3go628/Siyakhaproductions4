# Siyakha Productions website

## Run locally
1. Open the folder in Visual Studio Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and choose "Open with Live Server".

## Pages and structure
- `index.html` - home page.
- `about.html` - about the company.
- `technical-sound.html` - technical sound and live staging.
- `printing.html` - print solutions and running specials.
- `contact.html` - enquiry form and contact details.
- `privacy-policy/`, `cookie-policy/`, `terms-and-conditions/` - legal information.
- `sitemap.xml` - XML sitemap listing the public website pages for search engines.
- `robots.txt` - crawler instructions and sitemap location.
- `css/style.css` - design tokens, layout, responsive rules, motion and cookie/map styling.
- `css/promo.css` - isolated running-special styles.
- `js/main.js` - navigation, footer year, scroll effects and home hero slideshow.
- `js/promo.js` - promotion dates, countdown, ticker and contact-form special options.
- `js/forms.js` - contact-form validation, Web3Forms submission and enquiry routing.
- `js/cookie-consent.js` - consent notice, preference storage and consent-controlled scripts/embeds.

## SEO and indexing
- Sitemap: `https://siyakhaproductions.co.za/sitemap.xml`.
- `robots.txt` allows crawling and points search engines to the sitemap.
- Submit the sitemap URL in Google Search Console after the updated files are deployed.
- A sitemap helps search engines discover URLs; it does not guarantee indexing or rankings.
- Keep the sitemap updated when public pages are added, removed or their URLs change.

## Contact form and email routing
The contact form uses Web3Forms at `https://api.web3forms.com/submit`.
- General enquiries use the Info access key.
- Technical sound, printing, combined enquiries and running specials use the Sales access key.
- The access keys are public identifiers for the standard browser-side Web3Forms integration; they are not private server credentials. Do not place private credentials in front-end code.
- hCaptcha is used as the form's anti-spam check.
- Confirm the recipient email configured for each access key in the Web3Forms dashboard. The website selects the intended key, but inbox delivery depends on the dashboard configuration and provider delivery.

## Cookie preferences and third-party services
- Essential storage remembers the visitor's cookie choice.
- The interactive Google Map on the Contact page is held back until the visitor allows the Functional category. If not allowed, a local notice is displayed.
- The consent loader supports scripts staged as `type="text/plain"` with `data-cookie-category`; use `data-cookie-src` for an external script URL. Do not add analytics or advertising tags directly to page markup without consent gating.
- Google Fonts is requested for the Archivo typeface. This is a design asset request, not an analytics tag.
- Web3Forms and hCaptcha support contact-form delivery and security.
- No Google Analytics or advertising tracking tag is currently included in the website source. Update the policies and consent integration before adding either.

## Running specials
The promotion dates and offers are configured in `js/promo.js`. Its start and expiry dates use South African local calendar dates. The script adds the special options to the contact form while the promotion is live and routes those enquiries to Sales.

## Home hero performance
The logo video remains the first hero element. The slideshow loads the next photograph shortly before it is displayed instead of downloading all six hero photographs immediately after page load. Keep the existing image dimensions and slide order when editing the hero.

## Assets and usage
- `assets/logos/siyakha-logo.jpg` - supplied logo.
- `assets/images/` and `assets/icons/` - images and icons used by the pages.
- `assets/video/logo-assemble.mp4` - silent home hero logo animation.
- Confirm that Siyakha has permission to use all supplied photographs and only describe images as Siyakha's own work where that is accurate.

## Before launch or future integrations
- Confirm both Web3Forms access-key recipients in the Web3Forms dashboard and test Info and Sales routing.
- Test hCaptcha and successful/failed form submissions on the deployed domain.
- Test first-visit cookie choices, saved preferences, the Functional map gate and withdrawal of consent.
- If analytics or advertising tools are added, stage them through the consent loader and update both legal policies.
- Keep HTTPS enabled, maintain backups and review hosting security settings.
