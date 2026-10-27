// --- 1. የድምፅ አነባበብ (Text to Speech) ---
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // በእንግሊዝኛ እንዲያነብ
        window.speechSynthesis.speak(utterance);
    } else {
        alert("ስልክዎ ድምፅ ማሰማት አይደግፍም።");
    }
}

function speakQuestion() {
    if (quizData[currentQuestion]) {
        speakText(quizData[currentQuestion].question);
    }
}

// --- 2. የፈተና/ኩዊዝ Logic ---
const quizData = [
    {
        question: "'Good morning' ማለት ምን ማለት ነው?",
        options: ["እንደምን አመሹ", "እንደምን አደሩ", "መልካም ቀን", "ሰላም"],
        correct: 1
    },
    {
        question: "'Nice to meet you' የሚለው ሐረግ መቼ ጥቅም ላይ ይውላል?",
        options: ["ሲሰናበቱ", "ሰው ሲያመሰግኑ", "አዲስ ሰው ሲተዋወቁ", "ይቅርታ ሲጠይቁ"],
        correct: 2
    },
    {
        question: "'How are you?' ለሚለው ጥያቄ ትክክለኛ ምላሽ የትኛው ነው?",
        options: ["I am fine, thank you", "Good morning", "My name is John", "Nice to meet you"],
        correct: 0
    }
];

let currentQuestion = 0;
let score = 0;

function loadQuestion() {
    const qElement = document.getElementById("question");
    const optElement = document.getElementById("options");
    const feedback = document.getElementById("feedback");

    if (!qElement) return;

    feedback.innerText = "";
    qElement.innerText = quizData[currentQuestion].question;
    optElement.innerHTML = "";

    quizData[currentQuestion].options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.innerText = option;
        btn.onclick = () => checkAnswer(index);
        optElement.appendChild(btn);
    });
}

function checkAnswer(selectedIndex) {
    const feedback = document.getElementById("feedback");
    if (selectedIndex === quizData[currentQuestion].correct) {
        feedback.innerText = "ትክክል ነው! 🎉";
        feedback.style.color = "green";
        score++;
    } else {
        feedback.innerText = "ተሳስተዋል። ❌";
        feedback.style.color = "red";
    }

    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showScore();
        }
    }, 1200);
}

function showScore() {
    document.getElementById("quiz-box").classList.add("hidden");
    document.getElementById("score-box").classList.remove("hidden");
    
    // የነጥብ ማስቀመጫ (Local Storage)
    let highScore = localStorage.getItem("quizHighScore") || 0;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("quizHighScore", highScore);
    }

    document.getElementById("score-text").innerText = `ከ ${quizData.length} ጥያቄዎች ውስጥ ${score} አግኝተዋል!`;
    document.getElementById("high-score-text").innerText = `የእርስዎ ከፍተኛ ነጥብ (Best Score): ${highScore} / ${quizData.length}`;
}

function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById("quiz-box").classList.remove("hidden");
    document.getElementById("score-box").classList.add("hidden");
    loadQuestion();
}

// ገጹ ሲከፈት ጥያቄውን ጫን
window.onload = loadQuestion;
// Profile Page Functionality
document.addEventListener("DOMContentLoaded", () => {
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
