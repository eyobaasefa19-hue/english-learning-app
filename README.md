# EyobLingua — A1 Course Update v5

A mobile-first English-learning website with Amharic support, designed to be edited and tested from an Android phone.

## Included
- Home page and learning paths (Beginner / Intermediate / Advanced)
- Search and level filters for lessons
- English text-to-speech using browser/device speech synthesis
- Quiz with explanations and best-score tracking
- Local progress and profile name
- Local saved vocabulary (star button beside lesson vocabulary)
- Optional dark/light mode, remembered on the current device
- PWA manifest and service worker starter files

## Run on your phone
1. Extract the ZIP using your file manager.
2. Upload the files to your GitHub repository, keeping the HTML/CSS/JS files in the repository root.
3. In GitHub, open **Settings → Pages** and publish from the `main` branch and `/ (root)`.
4. Open the published HTTPS address in Chrome.

You may also preview `index.html` locally, but some features (especially service workers/PWA installation) require an HTTPS website or localhost.

## Important limitations
- This is a front-end starter. Profile and progress data are stored only in the current browser/device using localStorage. There is no real account system, cloud database, admin panel, or cross-device sync yet.
- Speech playback depends on the device/browser's installed English speech voices. Some Android WebView/APK wrappers do not expose speech synthesis correctly. Test audio in Chrome before packaging.
- Offline behavior depends on the service worker having been installed successfully from HTTPS and on the browser cache.
- This starter is not yet a production-scale course platform. Add validated lesson content, accessibility testing, security review, backend/authentication, analytics/privacy notices, and cross-browser tests before public launch.

## Project files
- `index.html` — home
- `lessons.html` — lesson library
- `quiz.html` — quiz
- `profile.html` — local learner profile/progress
- `style.css` — design system and responsive layout
- `script.js` — app interactions
- `manifest.json` — PWA metadata
- `sw.js` — offline caching starter


## v4 update notes
- Cache version is bumped to `eyoblingua-v4` so previously cached JavaScript and styles are replaced.
- HTML, JavaScript, and CSS use versioned asset URLs to avoid stale browser caches.
- Service worker uses a network-first strategy for app pages and core files, with an offline cache fallback.
- Speech playback waits briefly for Android Chrome voices to become available. Speech synthesis still depends on the voices installed on the device/browser.


## A1 course update (v5)
- Beginner track now includes 10 introductory lessons with Amharic explanations and English example phrases.
- Quiz includes additional A1 questions.
- Profile progress denominator updated for the 13 lessons currently listed.
- Cache version and asset URLs updated to v5.
