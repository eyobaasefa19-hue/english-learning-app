# EyobLingua — A2 Course Update v6

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


## A2 course update (v6)
- Added eight A2 / Elementary lessons: Past Simple, future plans, comparisons, countable and uncountable nouns, frequency adverbs, Present Continuous, advice, and polite requests/offers.
- Added nine matching A2 quiz questions.
- Previous v6 progress total was 21 lesson cards; the current v7 total is 29.
- Cache and asset versions updated to v6.


## B1 course update (v7)
- Added eight B1 / Intermediate lessons: Present Perfect, Past Continuous, First Conditional, Modal Verbs, Passive Voice, Relative Clauses, Reported Speech, and Linking Words.
- Added ten matching B1 quiz questions.
- Total lesson cards: 29 (10 A1/A1 starter + 8 A2 + 8 B1 + 3 existing preview/other cards as present in the project).
- Quiz bank now contains 33 questions.
- Updated asset and service-worker cache versions to v7.


## B2 course update (v8)
- Added eight B2 / Upper-Intermediate lessons: Third Conditional, Mixed Conditionals, Advanced Passive Structures, Cleft Sentences and Emphasis, Advanced Reported Speech, Advanced Linking Devices, Phrasal Verbs in Context, and Formal/Informal English.
- Added ten B2 quiz questions.
- Lesson cards total: 37. Quiz bank total: 43 questions.
- Updated asset references and service-worker cache to v8.


## C1 Advanced English — v9
- Added 8 C1 lessons: inversion, subjunctive, modal perfects, hedging, nominalisation, collocations, discourse markers, and reduced relative clauses.
- Added 10 C1 quiz questions.
- Total lesson cards in this release: 45.
- Total quiz questions in this release: 53.
- Updated asset versions and offline cache to v9.


## Premium UI / PWA refresh — v10
- Added a responsive premium design layer, improved mobile spacing, accessible focus states, and refined dark mode.
- Added a home dashboard highlight panel and original 192px / 512px PWA icons.
- Updated manifest metadata and added an offline fallback page.
- Service worker now caches shell assets independently, uses network-first navigation, and falls back to the offline page.
- Improved speech synthesis voice loading and guarded duplicate starts; actual voice availability remains device/browser dependent.
- Added local quiz result history (latest 10 attempts) and safer storage helpers.
- Preserved the existing lesson library and quiz bank.

### Important product limitations
This remains a static frontend/PWA. Learner name, completed lessons, saved words, and quiz history are stored locally on the current browser/device. There is no server-side account, database, admin CMS, or cross-device sync yet. Installability and offline behavior require HTTPS and a successful first online visit/cache installation. Test audio in the target Android browser; some WebView wrappers do not expose speech synthesis.


## Comprehensive Curriculum Expansion — v11
- Expanded the lesson library from 45 to 82 lesson cards.
- Added 37 structured bilingual lessons covering everyday vocabulary, family, food, time, question words, places, daily verbs, pronouns, articles, prepositions, countable/uncountable nouns, adverbs, modal verbs, phrasal verbs, collocations, word families, synonyms/antonyms, idioms, travel, health, tense contrast, conditionals, passive voice, reported speech, academic and workplace English, discourse markers, hedging, technology, environment, pronunciation, writing, listening/speaking strategies, inversion and C1–C2 precision vocabulary.
- Added 20 quiz questions; the quiz bank now contains 73 questions.
- Updated profile progress denominator and offline cache to v11.
- Each added vocabulary item includes an Amharic meaning and an English example; audio and save-word buttons are supported by the existing app logic.

## Curriculum scope
This is a broad practical learning curriculum, not an exhaustive dictionary of every English word. Further releases should add CEFR-mapped units, listening recordings, speaking tasks, graded readers, writing feedback, irregular verb tables, pronunciation practice and spaced-repetition review.


## v12 — Vocabulary and Verb Learning Tools
- Added a searchable English–Amharic vocabulary dictionary with example sentences, part-of-speech filters, browser speech playback, and locally saved words.
- Added an Irregular Verbs reference with base form, past simple, past participle, Amharic meaning, search, and pronunciation playback.
- Added direct links to both tools in the site navigation and home page.
- Updated the PWA cache version and app shell to include both new pages and their scripts.
- Dictionary saved words and learning progress are stored locally on the current browser/device; they do not sync across devices.


## v13 — Daily Practice Center
- Added a rotating Word of the Day with English audio playback.
- Added a lightweight spaced-repetition review queue for vocabulary saved in the dictionary.
- Review intervals progress through 1, 3, 7, 14 and 30 days when marked as remembered; "Again" schedules the item for another review today.
- Added 20 common idioms, 20 phrasal verbs, and 20 synonym/antonym pairs with Amharic support and examples.
- Added the Practice Center to navigation and the home page, and included its page and script in the service-worker app shell.
- Review scheduling and saved vocabulary remain local to the current browser/device.


## v14 — Four Skills Academy
- Added a dedicated Reading, Listening, Speaking and Writing practice page.
- Reading: three levels with short passages and comprehension questions.
- Listening: three levels with speech playback, optional transcript, and comprehension checks. Audio depends on the browser/device English TTS voice.
- Speaking: guided prompts, model answers, playback, and a self-assessment checklist. This release does not record microphone audio.
- Writing: level-based prompts, live word count, local draft saving, and a simple self-review checklist. It does not provide automatic grammar correction.
- Added navigation links and an offline app-shell entry for the new page.
- Writing drafts and practice state are stored locally in the current browser/device; no cloud account or sync is included.


## v15 — Grammar Master Academy
- Added a dedicated grammar learning academy with 19 structured modules from Beginner to Advanced.
- Covers parts of speech, nouns, pronouns, articles, adjectives/adverbs, prepositions, all 12 tense forms grouped into practical lessons, subject–verb agreement, modals, questions/negatives, passive voice, conditionals, reported speech, relative clauses, linking, inversion and subjunctive structures.
- Each module includes Amharic guidance, English examples, browser text-to-speech, and a self-check question with feedback.
- Added search, level filtering, local completion tracking, home-page entry and navigation links.
- Updated the service-worker cache to v15. Grammar completion data is local to the current browser/device and is not cloud-synced.


## v16 — Grammar Expansion & Challenge
- Expanded Grammar Academy from 20 to 33 modules with conjunctions, there is/are, quantifiers, comparisons, gerunds/infinitives, used to forms, wish/if only, causatives, participle clauses, ellipsis/substitution, punctuation, sentence word order, phrasal verbs and collocations.
- Added a randomized 10-question mixed grammar challenge, score summary, and locally saved latest result.
- Updated asset versions and service-worker cache to v16.
- Grammar completion and quiz results remain local to the browser/device; no account sync is included.


## Vocabulary Academy Expansion — v17
- Expanded the vocabulary dictionary to 90 bilingual entries spanning A1–C1.
- Added level and topic filters, search across words/meanings/examples, and part-of-speech filters.
- Added synonym/antonym fields where useful, example sentences, daily word, pronunciation through device speech synthesis, and a four-choice meaning challenge.
- Added locally saved and learned-word lists. These are stored in the current browser/device only.
- Updated shared asset versions and service-worker cache to v17.

### Vocabulary feature notes
The 90 entries are a curated starter collection, not a complete dictionary. Speech depends on English voices available in the browser/device. Saved and learned states are local to the current browser and are not synced across devices. Offline use requires a successful first visit over HTTPS and service-worker caching.


## v18 — Vocabulary Flashcards & Spaced Repetition
- Added interactive flashcards with reveal-answer and self-rating controls.
- Added review scheduling: Again (today), Hard (1 day), Good (progressive 1–30 days), and Easy (progressive 3–60 days).
- Added due-today, scheduled-word, and saved-word counts.
- Review schedule is stored locally on the current browser/device; it is not synced between devices.
- Updated vocabulary page asset versions and service-worker cache to v18.
