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
    }
];

let currentQuestion = 0;
let score = 0;

function loadQuestion() {
    const qElement = document.getElementById("question");
    const optElement = document.getElementById("options");
    const feedback = document.getElementById("feedback");

    if (!qElement) return; // ፈተና ገጽ ላይ ካልሆንን ኮዱ እንዳይሳሳት

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
    document.getElementById("score-text").innerText = `ከ ${quizData.length} ጥያቄዎች ውስጥ ${score} አግኝተዋል!`;
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
