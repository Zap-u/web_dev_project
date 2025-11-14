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
      const avg =
        responses.reduce((s, v) => s + (v ?? 0), 0) / responses.length;
      alert(
        `Quiz complete! (raw responses: ${responses.join(
          ", "
        )})\nApprox score: ${avg.toFixed(2)}`
      );
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
});
