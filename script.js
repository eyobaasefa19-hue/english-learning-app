// Speech Engine
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("ስልክዎ ድምፅ ማሰማት አይደግፍም::");
    }
}

// Quiz Data
const quizData = [
    {
        question: "'Nice to meet you' የሚለው ሐረግ መቼ ጥቅም ላይ ይውላል?",
        options: ["ሲሰናበቱ", "ሰው ሲያመሰግኑ", "አዲስ ሰው ሲተዋወቁ", "ይቅርታ ሲጠይቁ"],
        correct: 2
    },
    {
        question: "'Good morning' ማለት ምን ማለት ነው?",
        options: ["መልካም ምሽት", "እንደምን አደሩ", "መልካም ቀን", "ደህና ሁኑ"],
        correct: 1
    },
    {
        question: "'በጣም አመሰግናለሁ' የሚለው በእንግሊዝኛ የትኛው ነው?",
        options: ["Thank you very much", "You are welcome", "How are you", "Where are you from"],
        correct: 0
    },
    {
        question: "'You are welcome' የሚለው ሐረግ መልስ የሚሆነው ለየትኛው ነው?",
        options: ["ለሰላምታ", "ለ 'Thank you'", "ለይቅርታ", "ለስንብት"],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;

function loadQuiz() {
    const questionEl = document.getElementById("question");
    const optionsContainer = document.getElementById("options-container");
    const quizContainer = document.getElementById("quiz-container");
    const resultContainer = document.getElementById("result-container");

    if (!questionEl || !optionsContainer || !quizContainer || !resultContainer) return;

    if (currentQuestion < quizData.length) {
        quizContainer.style.display = "block";
        resultContainer.style.display = "none";

        const q = quizData[currentQuestion];
        questionEl.textContent = `${currentQuestion + 1}. ${q.question}`;
        optionsContainer.innerHTML = "";

        q.options.forEach((opt, index) => {
            const btn = document.createElement("button");
            btn.className = "btn option-btn";
            btn.textContent = opt;
            btn.onclick = () => selectOption(index);
            optionsContainer.appendChild(btn);
        });
    } else {
        showResults();
    }
}

function selectOption(selectedIndex) {
    if (selectedIndex === quizData[currentQuestion].correct) {
        score++;
    }
    currentQuestion++;
    loadQuiz();
}

function showResults() {
    const quizContainer = document.getElementById("quiz-container");
    const resultContainer = document.getElementById("result-container");
    const finalScoreEl = document.getElementById("final-score");
    const bestScoreDisplay = document.getElementById("best-score-display");

    if (quizContainer) quizContainer.style.display = "none";
    if (resultContainer) resultContainer.style.display = "block";

    if (finalScoreEl) {
        finalScoreEl.textContent = `ከ ${quizData.length} ጥያቄዎች ውስጥ ${score} አግኝተዋል!`;
    }

    const currentBest = parseInt(localStorage.getItem("bestScore") || "0");
    if (score > currentBest) {
        localStorage.setItem("bestScore", score.toString());
    }

    const updatedBest = Math.max(score, currentBest);
    if (bestScoreDisplay) {
        bestScoreDisplay.textContent = `የእርስዎ ከፍተኛ ነጥብ (Best Score): ${updatedBest} / ${quizData.length}`;
    }
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    loadQuiz();
}

// User Profile Logic
document.addEventListener("DOMContentLoaded", () => {
    loadQuiz();

    const nameDisplay = document.getElementById("user-name-display");
    const scoreDisplay = document.getElementById("user-score-display");
    const nameInput = document.getElementById("name-input");
    const saveBtn = document.getElementById("save-profile-btn");

    if (nameDisplay && scoreDisplay) {
        const savedName = localStorage.getItem("userName") || "አልተመዘገበም";
        const bestScore = localStorage.getItem("bestScore") || "0";
        
        nameDisplay.textContent = savedName;
        scoreDisplay.textContent = bestScore;
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const enteredName = nameInput.value.trim();
            if (enteredName !== "") {
                localStorage.setItem("userName", enteredName);
                if (nameDisplay) nameDisplay.textContent = enteredName;
                alert("ስምዎት በተሳካ ሁኔታ ተቀምጧል!");
                nameInput.value = "";
            } else {
                alert("እባክዎን ስምዎን ያስገቡ!");
            }
        });
    }
});
