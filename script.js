(() => {
  "use strict";
  const KEY = {
    name: "eyoblingua_name_v2",
    best: "eyoblingua_best_score_v2",
    completed: "eyoblingua_completed_lessons_v2",
    words: "eyoblingua_words_learned_v2"
  };
  const $ = (id) => document.getElementById(id);
  const readJSON = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (_) { return fallback; }
  };
  const writeJSON = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  };
  const completed = () => readJSON(KEY.completed, []);
  const bestScore = () => Number(localStorage.getItem(KEY.best) || 0);
  const wordsLearned = () => Number(localStorage.getItem(KEY.words) || 0);

  // Speech synthesis: supported in most browsers, but not guaranteed inside every APK/WebView.
  function speakText(text, button) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      alert("ይህ አሳሽ የድምፅ ማንበብን አይደግፍም። Chrome ውስጥ ሞክር።");
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.88;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => /^en(-|_)/i.test(v.lang) && /Google|English|US/i.test(v.name))
        || voices.find(v => /^en(-|_)/i.test(v.lang));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.onerror = () => {
        if (button) button.textContent = "🔊 Try again";
      };
      utterance.onend = () => {
        if (button) button.textContent = "🔊 Listen";
      };
      window.speechSynthesis.speak(utterance);
      if (button) button.textContent = "🔊 Playing…";
    } catch (_) {
      alert("ድምፁ ሊጀምር አልቻለም። እባክህ Chrome ውስጥ ሞክር።");
    }
  }
  document.querySelectorAll("[data-speak]").forEach(button => {
    button.addEventListener("click", () => speakText(button.dataset.speak, button));
  });


  // Modern UI enhancements: saved theme, lightweight notifications, saved vocabulary and streak.
  const THEME_KEY = "eyoblingua_theme_v3";
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark" || savedTheme === "light") document.documentElement.dataset.theme = savedTheme;
  const themeButton = $("theme-toggle");
  function syncThemeButton() {
    if (!themeButton) return;
    const dark = document.documentElement.dataset.theme === "dark";
    themeButton.textContent = dark ? "☀" : "☾";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.title = dark ? "ብርሃን ሁነታ" : "ጨለማ ሁነታ";
  }
  syncThemeButton();
  themeButton?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    syncThemeButton();
  });

  let toastTimer;
  function toast(message) {
    let node = $("eyob-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "eyob-toast";
      node.className = "toast-message";
      node.setAttribute("role", "status");
      node.setAttribute("aria-live", "polite");
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2400);
  }

  // Save vocabulary locally without an account; buttons work offline once page is available.
  const SAVED_WORDS_KEY = "eyoblingua_saved_words_v3";
  const getSavedWords = () => readJSON(SAVED_WORDS_KEY, []);
  document.querySelectorAll(".vocab-row").forEach((row, index) => {
    const english = row.querySelector("strong")?.textContent?.trim();
    const amharic = row.querySelector("span")?.textContent?.trim() || "";
    if (!english) return;
    const save = document.createElement("button");
    save.type = "button";
    save.className = "audio-btn save-word-btn";
    save.textContent = "☆";
    save.title = "ቃሉን አስቀምጥ";
    save.setAttribute("aria-label", `${english} — ቃሉን አስቀምጥ`);
    const refreshSave = () => {
      const exists = getSavedWords().some(w => w.english === english);
      save.textContent = exists ? "★" : "☆";
      save.title = exists ? "ከተቀመጡ ቃላት አስወግድ" : "ቃሉን አስቀምጥ";
      save.setAttribute("aria-pressed", String(exists));
    };
    save.addEventListener("click", () => {
      let words = getSavedWords();
      if (words.some(w => w.english === english)) {
        words = words.filter(w => w.english !== english);
        toast("ቃሉ ከተቀመጡ ቃላት ተወግዷል።");
      } else {
        words.push({english, amharic, savedAt: Date.now()});
        toast("ቃሉ ተቀምጧል።");
      }
      writeJSON(SAVED_WORDS_KEY, words);
      refreshSave();
    });
    const actions = row.querySelector(".vocab-actions") || row;
    actions.appendChild(save);
    refreshSave();
  });

  // Daily activity marker is local to this browser and does not claim account-wide syncing.
  const ACTIVITY_KEY = "eyoblingua_activity_days_v3";
  const todayKey = new Date().toISOString().slice(0, 10);
  const activityDays = readJSON(ACTIVITY_KEY, []);
  if (!activityDays.includes(todayKey)) {
    activityDays.push(todayKey);
    writeJSON(ACTIVITY_KEY, activityDays.slice(-60));
  }

  // Mobile navigation
  const toggle = $("menu-toggle"), nav = $("nav-links");
  if (toggle && nav) toggle.addEventListener("click", () => {
    const opened = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(opened));
  });

  // Lesson filtering and saved completion
  const search = $("lesson-search");
  const chips = [...document.querySelectorAll(".filter-chip")];
  let activeLevel = "all";
  function filterLessons() {
    const query = (search?.value || "").toLowerCase().trim();
    let shown = 0;
    document.querySelectorAll(".lesson-card").forEach(card => {
      const matchesLevel = activeLevel === "all" || card.dataset.level === activeLevel;
      const matchesQuery = !query || card.textContent.toLowerCase().includes(query);
      card.classList.toggle("hidden", !(matchesLevel && matchesQuery));
      if (matchesLevel && matchesQuery) shown++;
    });
    $("no-lessons")?.classList.toggle("hidden", shown > 0);
  }
  search?.addEventListener("input", filterLessons);
  chips.forEach(chip => chip.addEventListener("click", () => {
    activeLevel = chip.dataset.level;
    chips.forEach(c => c.classList.toggle("active", c === chip));
    filterLessons();
  }));
  function updateLessonButtons() {
    const done = completed();
    document.querySelectorAll(".mark-lesson").forEach(button => {
      const isDone = done.includes(button.dataset.lesson);
      button.classList.toggle("done", isDone);
      button.textContent = isDone ? "✓ ተጠናቋል — እንደገና ጫን ለመቀየር" : "✓ ትምህርቱን ጨርሻለሁ";
    });
  }
  document.querySelectorAll(".mark-lesson").forEach(button => button.addEventListener("click", () => {
    let done = completed();
    if (done.includes(button.dataset.lesson)) done = done.filter(x => x !== button.dataset.lesson);
    else done.push(button.dataset.lesson);
    writeJSON(KEY.completed, done);
    updateLessonButtons();
    refreshStats();
  }));
  updateLessonButtons();

  // Quiz
  const quizData = [
    {question:"'Nice to meet you' የሚለው መቼ ይጠቀማል?", options:["ሲሰናበቱ","ሰው ሲያመሰግኑ","አዲስ ሰው ሲተዋወቁ","ይቅርታ ሲጠይቁ"], correct:2, explain:"አዲስ ሰው ሲተዋወቁ 'Nice to meet you' ማለት ይቻላል።"},
    {question:"'Good morning' ማለት ምን ማለት ነው?", options:["መልካም ምሽት","እንደምን አደርክ/አደርሽ","መልካም ሌሊት","ደህና ሁን"], correct:1, explain:"Good morning የጠዋት ሰላምታ ነው።"},
    {question:"'በጣም አመሰግናለሁ' በእንግሊዝኛ ምንድን ነው?", options:["You are welcome","How are you?","Thank you very much","Where are you from?"], correct:2, explain:"Thank you very much = በጣም አመሰግናለሁ።"},
    {question:"'You are welcome' ብዙ ጊዜ ለምን ምላሽ ይሆናል?", options:["ለ 'Thank you'","ለሰላምታ","ለስንብት","ለ 'Good morning'"], correct:0, explain:"ሰው ሲያመሰግንህ 'You are welcome' ማለት ትችላለህ።"},
    {question:"የትኛው ትክክለኛ አረፍተ ነገር ነው?", options:["She study English.","She studies English.","She studying English.","She studys English."], correct:1, explain:"በPresent Simple ውስጥ He/She/It ጋር ብዙ ጊዜ በግስ ላይ -s ይጨመራል።"},
    {question:"'I am from Ethiopia' ማለት ምንድን ነው?", options:["ወደ ኢትዮጵያ እሄዳለሁ","ኢትዮጵያን እወዳለሁ","ከኢትዮጵያ ነኝ","ኢትዮጵያ ውስጥ እማራለሁ"], correct:2, explain:"I am from Ethiopia = ከኢትዮጵያ ነኝ።"},
    {question:"የትኛው ጨዋ ጥያቄ ነው?", options:["Give me that!","Could you help me, please?","You help me now.","I want it."], correct:1, explain:"Could you help me, please? ጨዋ የእርዳታ ጥያቄ ነው።"},
    {question:"'I don't understand' ማለት ምንድን ነው?", options:["አልገባኝም","አልሰማሁም","አውቃለሁ","እስማማለሁ"], correct:0, explain:"I don't understand = አልገባኝም።"}
  ];
  let questionIndex = 0, score = 0, answered = false;
  function loadQuestion() {
    const question = $("question"), options = $("options-container");
    if (!question || !options) return;
    answered = false;
    $("feedback").textContent = "";
    $("feedback").className = "feedback";
    $("next-question").classList.add("hidden");
    const q = quizData[questionIndex];
    $("question-count").textContent = `ጥያቄ ${questionIndex + 1} / ${quizData.length}`;
    $("quiz-score").textContent = `ነጥብ: ${score}`;
    $("quiz-progress").style.width = `${questionIndex / quizData.length * 100}%`;
    question.textContent = q.question;
    options.innerHTML = "";
    q.options.forEach((option, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-btn";
      button.textContent = `${String.fromCharCode(65 + i)}. ${option}`;
      button.addEventListener("click", () => chooseAnswer(i));
      options.appendChild(button);
    });
  }
  function chooseAnswer(index) {
    if (answered) return;
    answered = true;
    const q = quizData[questionIndex], buttons = [...$("options-container").querySelectorAll("button")];
    buttons.forEach((button, i) => {
      button.disabled = true;
      if (i === q.correct) button.classList.add("correct");
      else if (i === index) button.classList.add("wrong");
    });
    const feedback = $("feedback");
    if (index === q.correct) {
      score++;
      feedback.textContent = `ትክክል! ${q.explain}`;
      feedback.classList.add("good");
    } else {
      feedback.textContent = `ትክክለኛው መልስ: ${q.options[q.correct]}። ${q.explain}`;
      feedback.classList.add("bad");
    }
    $("quiz-score").textContent = `ነጥብ: ${score}`;
    $("next-question").textContent = questionIndex === quizData.length - 1 ? "ውጤት አሳይ →" : "ቀጣይ ጥያቄ →";
    $("next-question").classList.remove("hidden");
  }
  function showResults() {
    $("quiz-container")?.classList.add("hidden");
    $("result-container")?.classList.remove("hidden");
    const percent = Math.round(score / quizData.length * 100);
    $("final-score").textContent = `${quizData.length} ጥያቄዎች ውስጥ ${score} ትክክለኛ መልስ — ${percent}%`;
    $("result-message").textContent = percent >= 80 ? "እጅግ ጥሩ! እውቀትህ እየጠነከረ ነው።" : percent >= 50 ? "ጥሩ ሙከራ! ትምህርቶቹን እንደገና ተመልከት።" : "ተስፋ አትቁረጥ፤ ትምህርቶቹን አንብብና እንደገና ሞክር።";
    const previous = bestScore();
    if (percent > previous) localStorage.setItem(KEY.best, String(percent));
    $("best-score-display").textContent = `ከፍተኛ ውጤት: ${Math.max(percent, previous)}%`;
    refreshStats();
  }
  $("next-question")?.addEventListener("click", () => {
    questionIndex++;
    if (questionIndex >= quizData.length) showResults();
    else loadQuestion();
  });
  $("restart-quiz")?.addEventListener("click", () => {
    questionIndex = 0; score = 0;
    $("quiz-container")?.classList.remove("hidden");
    $("result-container")?.classList.add("hidden");
    loadQuestion();
  });
  if ($("question") && $("options-container")) loadQuestion();

  // Profile
  const profileName = $("profile-name"), nameInput = $("name-input");
  if (profileName) {
    const savedName = localStorage.getItem(KEY.name) || "ተማሪ";
    profileName.textContent = savedName;
    if (nameInput) nameInput.value = savedName === "ተማሪ" ? "" : savedName;
  }
  $("profile-form")?.addEventListener("submit", event => {
    event.preventDefault();
    const value = nameInput.value.trim();
    if (!value) { $("profile-message").textContent = "እባክህ ስምህን አስገባ።"; return; }
    localStorage.setItem(KEY.name, value);
    profileName.textContent = value;
    $("profile-message").textContent = "ስምህ በዚህ መሣሪያ ተቀምጧል።";
  });
  $("reset-progress")?.addEventListener("click", () => {
    if (!confirm("የተቀመጠውን እድገት በዚህ አሳሽ ውስጥ ማጥፋት ትፈልጋለህ?")) return;
    [KEY.best, KEY.completed, KEY.words, SAVED_WORDS_KEY, ACTIVITY_KEY].forEach(k => localStorage.removeItem(k));
    refreshStats();
    if ($("profile-lessons")) updateProfile();
    updateLessonButtons();
    alert("የእድገት መረጃ ተጀምሯል።");
  });

  function refreshStats() {
    const done = completed().length;
    if ($("lessons-completed")) $("lessons-completed").textContent = done;
    if ($("best-score")) $("best-score").textContent = `${bestScore()}%`;
    if ($("words-learned")) $("words-learned").textContent = wordsLearned();
    updateProfile();
  }
  function updateProfile() {
    if ($("profile-lessons")) $("profile-lessons").textContent = `${completed().length} / 6`;
    if ($("profile-lesson-bar")) $("profile-lesson-bar").style.width = `${completed().length / 6 * 100}%`;
    if ($("profile-best")) $("profile-best").textContent = `${bestScore()}%`;
    if ($("profile-words")) $("profile-words").textContent = wordsLearned();
  }
  // Count words shown in the lesson library as learned only when the user completes a lesson.
  document.querySelectorAll(".mark-lesson").forEach(button => button.addEventListener("click", () => {
    const ids = completed();
    localStorage.setItem(KEY.words, String(ids.length * 4));
  }));
  refreshStats();
})();