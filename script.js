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
      const startSpeech = () => {
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => /^en(-|_)/i.test(v.lang) && /Google|English|US/i.test(v.name))
          || voices.find(v => /^en(-|_)/i.test(v.lang));
        if (englishVoice) utterance.voice = englishVoice;
        utterance.onerror = () => {
          if (button) button.textContent = "🔊 Try again";
          toast("ድምፅ አልተገኘም። የስልክህን Text-to-Speech ቅንብር ፈትሽ።");
        };
        utterance.onend = () => {
          if (button) button.textContent = "🔊 Listen";
        };
        window.speechSynthesis.speak(utterance);
        if (button) button.textContent = "🔊 Playing…";
      };
      // Android Chrome may load its speech voices asynchronously.
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length) {
        startSpeech();
      } else {
        const voiceTimeout = setTimeout(startSpeech, 700);
        window.speechSynthesis.addEventListener?.("voiceschanged", function onVoicesChanged() {
          clearTimeout(voiceTimeout);
          window.speechSynthesis.removeEventListener?.("voiceschanged", onVoicesChanged);
          startSpeech();
        }, { once: true });
      }
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
    ,
    {question:"'How old are you?' ምን ማለት ነው?", options:["ስምህ ማን ነው?","ዕድሜህ ስንት ነው?","ከየት ነህ?","የት ትኖራለህ?"], correct:1, explain:"How old are you? = ዕድሜህ ስንት ነው?"},
    {question:"'Mother' ማለት ምንድን ነው?", options:["እህት","አባት","እናት","ወንድም"], correct:2, explain:"Mother = እናት።"},
    {question:"'I wake up at seven' ምን ማለት ነው?", options:["በሰባት ሰዓት እነሳለሁ","በሰባት እተኛለሁ","ቁርስ እበላለሁ","ወደ ቤት እሄዳለሁ"], correct:0, explain:"I wake up at seven = በሰባት ሰዓት እነሳለሁ።"},
    {question:"'I would like water, please' የሚለው ምን ይገልጻል?", options:["ውሃ አልፈልግም","እባክዎ ውሃ እፈልጋለሁ","ውሃ የት አለ?","ውሃ አልጠጣም"], correct:1, explain:"I would like water, please = እባክዎ ውሃ እፈልጋለሁ።"},
    {question:"'Turn left' ማለት ምንድን ነው?", options:["ወደ ቀኝ ታጠፍ","ቀጥታ ሂድ","ወደ ግራ ታጠፍ","ቆም"], correct:2, explain:"Turn left = ወደ ግራ ታጠፍ።"},
    {question:"ትክክለኛውን አረፍተ ነገር ምረጥ።", options:["I is Ethiopian.","I am Ethiopian.","I are Ethiopian.","I be Ethiopian."], correct:1, explain:"ከI ጋር am እንጠቀማለን።"}
    ,
    {question:"Yesterday, I ___ my friend.", options:["visit","visited","visiting","visits"], correct:1, explain:"Past Simple ለመደበኛ ግሶች ብዙ ጊዜ -ed ይጨመራል።"},
    {question:"'Go' የPast Simple ቅርጹ ምንድን ነው?", options:["goed","gone","went","going"], correct:2, explain:"Go → went የማይደበኛ ግስ ነው።"},
    {question:"She ___ going to study tonight.", options:["am","are","is","be"], correct:2, explain:"ከShe ጋር is going to እንጠቀማለን።"},
    {question:"'Bigger' የሚለው ምን ይገልጻል?", options:["ንጽጽር","ያለፈ ጊዜ","ብዙ ቁጥር","ትእዛዝ"], correct:0, explain:"Bigger የbig የcomparative ቅርጽ ነው።"},
    {question:"የትኛው ከUncountable noun ጋር ይጠቀማል?", options:["many","much","few","several"], correct:1, explain:"Much water እንላለን፤ water በዚህ አጠቃቀም የማይቆጠር ስም ነው።"},
    {question:"'I ___ study English.' (ሁልጊዜ)", options:["never","always","yesterday","now"], correct:1, explain:"Always = ሁልጊዜ።"},
    {question:"They ___ playing football now.", options:["is","am","are","be"], correct:2, explain:"Present Continuous: They are + verb-ing።"},
    {question:"You ___ practise every day. (ምክር)", options:["should","shouldn't to","are","did"], correct:0, explain:"ምክር ለመስጠት should + base verb እንጠቀማለን።"},
    {question:"በጨዋነት ጥያቄ የትኛው ነው?", options:["Open it now!","Could you open the window, please?","You open window.","Window open."], correct:1, explain:"Could you ... please? ጨዋ የጥያቄ አገላለጽ ነው።"}

    ,
    {question:"Present Perfect የትኛው ትክክለኛ ነው?", options:["I have finished my work.","I has finished my work.","I finished have my work.","I have finish my work."], correct:0, explain:"Present Perfect = have/has + past participle።"},
    {question:"They ___ watching TV when I arrived.", options:["was","were","is","be"], correct:1, explain:"They ጋር Past Continuous ውስጥ were + verb-ing እንጠቀማለን።"},
    {question:"If it rains, we ___ at home.", options:["stayed","staying","will stay","stays"], correct:2, explain:"First Conditional: If + Present Simple, will + base verb።"},
    {question:"'You must wear a seat belt' ምን ይገልጻል?", options:["ዕድል","ግዴታ","ያለፈ ጊዜ","ምክር ብቻ"], correct:1, explain:"Must ግዴታን ወይም ጠንካራ አስፈላጊነትን ይገልጻል።"},
    {question:"Passive Voice የትኛው ነው?", options:["People speak English.","English is spoken here.","People are speak English.","English speaks people."], correct:1, explain:"Passive voice = be + past participle።"},
    {question:"The woman ___ lives here is a doctor.", options:["which","where","who","when"], correct:2, explain:"Who ለሰው የሚያመለክት relative pronoun ነው።"},
    {question:"Direct: He said, “I am tired.” Reported:", options:["He said he is tired.","He said he was tired.","He says I was tired.","He said I am tired."], correct:1, explain:"Reported speech ውስጥ በተለመደው backshift am → was ይሆናል።"},
    {question:"'Although' በዚህ አጠቃቀም ምን ያሳያል?", options:["ምክንያት","ተቃርኖ","ጊዜ","ቦታ"], correct:1, explain:"Although ተቃራኒ ወይም የሚጋጭ ሀሳብ ያገናኛል።"},
    {question:"I have ___ been to Kenya. (በሕይወቴ አንድም ጊዜ አልሄድኩም)", options:["ever","never","yet","already"], correct:1, explain:"Never = ፈጽሞ አልሆነም/አልተፈጸመም።"},
    {question:"We were studying ___ the lights went out.", options:["because","when","although","therefore"], correct:1, explain:"When የሌላ ክስተት መከሰትን ለማሳየት ይጠቅማል።"}

    ,
    {question:"Third Conditional ትክክለኛው ቅርጽ የትኛው ነው?", options:["If I study, I pass.","If I had studied, I would have passed.","If I studied, I will pass.","If I have studied, I passed."], correct:1, explain:"Third Conditional = If + past perfect, would have + past participle።"},
    {question:"If I had learned to drive, I ___ a car now.", options:["will have","would have","would have had","had"], correct:1, explain:"Mixed Conditional ያለፈ ሁኔታን ከአሁኑ ውጤት ጋር ያገናኛል።"},
    {question:"The results ___ tomorrow. (Future Passive)", options:["announce","will announce","will be announced","are announcing"], correct:2, explain:"Future Passive = will be + past participle።"},
    {question:"___ I need is more practice.", options:["Who","What","Where","When"], correct:1, explain:"What I need is... ሀሳብን ለማጉላት የሚጠቅም cleft structure ነው።"},
    {question:"The teacher advised us ___ regularly.", options:["revise","revising","to revise","revised"], correct:2, explain:"advise + object + to-infinitive: advised us to revise።"},
    {question:"'Nevertheless' ምን ያሳያል?", options:["ተቃርኖ","ተጨማሪ መረጃ","ጊዜ","ቦታ"], correct:0, explain:"Nevertheless = እንደዚያ ቢሆንም፤ ተቃርኖን ያሳያል።"},
    {question:"'Put off the meeting' ማለት ምንድን ነው?", options:["ስብሰባውን ማስጀመር","ስብሰባውን ማዘግየት","ስብሰባውን ማጠናቀቅ","ስብሰባውን መርሳት"], correct:1, explain:"Put off = ማዘግየት/ወደ ሌላ ጊዜ ማስተላለፍ።"},
    {question:"ለመደበኛ ኢሜይል የተሻለው አገላለጽ የትኛው ነው?", options:["Send it now.","Hey, give me that.","Could you please send me the file?","Gimme the file."], correct:2, explain:"Could you please... ጨዋና መደበኛ የጥያቄ አገላለጽ ነው።"},
    {question:"'Furthermore' በጽሑፍ ምን ይጠቅማል?", options:["ተጨማሪ ሀሳብ ለማቅረብ","ተቃርኖ ለማሳየት","ጊዜ ለመግለጽ","ሁኔታ ለማቅረብ"], correct:0, explain:"Furthermore = በተጨማሪ፤ ተጨማሪ ነጥብ ያቀርባል።"},
    {question:"Which sentence is a correct modal passive?", options:["The form must sign.","The form must be signed.","The form must signed.","The form must been signed."], correct:1, explain:"Modal Passive = modal + be + past participle።"}
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
    if ($("profile-lessons")) $("profile-lessons").textContent = `${completed().length} / 37`;
    if ($("profile-lesson-bar")) $("profile-lesson-bar").style.width = `${Math.min(completed().length / 37 * 100, 100)}%`;
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