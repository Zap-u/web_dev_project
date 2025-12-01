//questions: [physical, creative, calm, learning, indoor-outoor, hands-on]
const hobbies = {
  photography: [2, 4, 3, 3, 3, 4],
  reading: [0, 2, 4, 3, 1, 0],
  gaming: [0, 2, 2, 2, 0, 1],
  music: [1, 4, 3, 4, 1, 3],
  fitness: [4, 1, 1, 3, 3, 3],
  cooking: [1, 3, 3, 4, 1, 4],
  painting: [1, 4, 4, 4, 1, 4],
  crafting: [1, 4, 4, 3, 0, 3],
  running: [4, 0, 2, 2, 4, 2],
  yoga: [2, 1, 4, 3, 2, 3],
  journaling: [0, 4, 4, 3, 1, 1],
  boardgames: [0, 2, 3, 4, 1, 1],
  puzzles: [0, 2, 4, 3, 1, 1],
  singing: [1, 4, 3, 4, 1, 2],
  dance: [4, 4, 2, 3, 2, 2],
};

function distance(userAnswers, hobby) {
  let sum = 0;
  for (let i = 0; i < userAnswers.length; i++) {
    sum += Math.abs(userAnswers[i] - hobby[i]);
  }
  return sum;
}

function findBestHobby(userAnswers) {
  let filteredHobbies = [];
  let filteredScores = [];
  for (let hobby in hobbies) {
    console.log(hobbies[hobby]);
    let s = distance(userAnswers, hobbies[hobby]);

    // Add hobby to filtered lists, which are sorted
    let added = false;
    for (let i = 0; i < filteredScores.length; i++) {
      if (s < filteredScores[i]) {
        filteredScores.splice(i, 0, s);
        filteredHobbies.splice(i, 0, hobby);
        added = true;
        break;
      }
    }
    if (!added) {
      filteredScores.push(s);
      filteredHobbies.push(hobby);
    }
  }
  console.log(filteredHobbies);
  console.log(filteredScores);
  console.log("the best hobby for you is: " + filteredHobbies[0]);

  return { filteredHobbies, filteredScores };
}

document.addEventListener("DOMContentLoaded", () => {
  const questions = [
    {
      text: "How much do you enjoy physical activity?",
      answers: [
        "Not at all",
        "A little",
        "Moderately",
        "Quite a bit",
        "Very much",
      ],
    },
    {
      text: "How creative would you say you are?",
      answers: [
        "Not creative",
        "A bit creative",
        "Moderately creative",
        "Very creative",
        "Extremely creative",
      ],
    },
    {
      text: "Do you enjoy calm relaxing activities?",
      answers: ["Not at all", "Sometimes", "Neutral", "Often", "Very much"],
    },
    {
      text: "How much do you enjoy learning new skills?",
      answers: ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"],
    },
    {
      text: "Do you prefer indoor or outdoor activities?",
      answers: [
        "Strongly indoor",
        "Indoor",
        "Both",
        "Outdoor",
        "Strongly outdoor",
      ],
    },
    {
      text: "Do you enjoy hands-on activities?",
      answers: [
        "Not at all",
        "A little",
        "Somewhat",
        "Quite a bit",
        "Very much",
      ],
    },
  ];

  let current = 0;
  const responses = new Array(questions.length).fill(null);

  const qNumberEl = document.getElementById("question-number");
  const qTextEl = document.getElementById("question-text");
  const answersEl = document.getElementById("answers");
  const progressEl = document.getElementById("progress-bar");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  function renderAnswers() {
    answersEl.innerHTML = "";
    const q = questions[current];
    q.answers.forEach((ans, idx) => {
      const label = document.createElement("label");
      label.className = "answer-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = idx;
      if (responses[current] === idx) input.checked = true;

      const span = document.createElement("span");
      span.textContent = `${idx + 1} - ${ans}`;

      label.appendChild(input);
      label.appendChild(span);

      answersEl.appendChild(label);
    });
  }

  function updateProgress() {
    const pct = ((current + 1) / questions.length) * 100;
    progressEl.style.width = pct + "%";
  }

  function updateQuestion() {
    qNumberEl.textContent = `Question ${current + 1} of ${questions.length}`;
    qTextEl.textContent = questions[current].text;
    renderAnswers();
    updateProgress();

    prevBtn.disabled = current === 0;
    prevBtn.style.opacity = prevBtn.disabled ? "0.6" : "1";

    nextBtn.textContent = current === questions.length - 1 ? "Finish" : "Next";
  }

  nextBtn.addEventListener("click", () => {
    const selected = document.querySelector("input[name='answer']:checked");
    if (!selected) {
      alert("Please choose an answer before continuing.");
      return;
    }
    responses[current] = Number(selected.value);

    if (current < questions.length - 1) {
      current++;
      updateQuestion();
      const firstInput = document.querySelector("input[name='answer']");
      if (firstInput) firstInput.focus();
    } else {
      console.log("Responses:", responses);
      const result = findBestHobby(responses);
      const bestHobbyKey = result.filteredHobbies[0];
      showHobbyResultPopup(bestHobbyKey);
    }
  });

  prevBtn.addEventListener("click", () => {
    const selected = document.querySelector("input[name='answer']:checked");
    if (selected) responses[current] = Number(selected.value);

    if (current > 0) {
      current--;
      updateQuestion();
    }
  });

  updateQuestion();

  function showHobbyResultPopup(hobbyKey) {
    // Map lowercase hobby keys to capitalized names in data.json
    const hobbyNameMap = {
      photography: "Photography",
      reading: "Reading",
      gaming: "Gaming",
      music: "Music",
      fitness: "Fitness",
      cooking: "Cooking",
      painting: "Painting",
      crafting: "Crafting",
      running: "Running",
      yoga: "Yoga",
      journaling: "Journaling",
      boardgames: "Board Games",
      puzzles: "Puzzles",
      singing: "Singing",
      dance: "Dance",
    };

    const hobbyName = hobbyNameMap[hobbyKey] || hobbyKey;

    // Fetch hobby data from data.json
    fetch("data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data.json");
        return res.json();
      })
      .then((data) => {
        const allHobbies = [
          ...(data.home?.popularHobbies || []),
          ...(data.home?.extraHobbies || []),
        ];

        const hobby = allHobbies.find((h) => h.name === hobbyName);

        if (!hobby) {
          console.error("Hobby not found:", hobbyName);
          return;
        }

        // Create popup overlay
        const overlay = document.createElement("div");
        overlay.className = "quiz-result-overlay";
        overlay.innerHTML = `
          <div class="quiz-result-popup">
            <div class="quiz-result-header">
              <h2>Your Perfect Hobby Match!</h2>
              <button class="quiz-result-close" aria-label="Close">&times;</button>
            </div>
            <div class="quiz-result-content">
              <div class="quiz-result-icon-wrapper">
                <img src="${hobby.icon}" alt="${
          hobby.name
        }" class="quiz-result-icon" />
              </div>
              <h3 class="quiz-result-name">${hobby.name}</h3>
              <p class="quiz-result-message">Based on your answers, ${
                hobby.name
              } is the perfect hobby for you!</p>
              <a href="hobby.html?name=${encodeURIComponent(
                hobby.name
              )}" class="quiz-result-button">
                Explore ${hobby.name}
              </a>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);

        // Close button functionality
        const closeBtn = overlay.querySelector(".quiz-result-close");
        const closePopup = () => {
          overlay.remove();
        };

        closeBtn.addEventListener("click", closePopup);
        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) {
            closePopup();
          }
        });

        // Add fade-in animation
        setTimeout(() => {
          overlay.classList.add("show");
        }, 10);
      });
  }
});
