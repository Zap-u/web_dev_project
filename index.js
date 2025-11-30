export function loadIndexPage() {
  fetch("data.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data.json");
      return res.json();
    })
    .then((data) => {
      renderWelcome();
      renderPopularHobbies(data.home.popularHobbies || []);
      initQuizIfAvailable();
    })
    .catch((err) => {
      console.error("Error loading home page data:", err);
    });
}

function renderWelcome() {
  const container = document.getElementById("welcomeContainer");
  if (!container) {
    console.error("welcomeContainer not found in HTML.");
    return;
  }

  container.innerHTML = `
    <h2>Welcome to HobbyBC</h2>
    <p>Your gateway to discovering and exploring new hobbies</p>
    <p>
      Life is too short to be bored! HobbyBC helps you discover activities
      that match your interests, personality, and lifestyle. Whether you're
      looking for something active, creative, social, or relaxing, we've got
      you covered.
    </p>
    <p>
      Take our personalized quiz to get hobby recommendations, explore our
      extensive catalog of hobbies organized by category, and connect with a
      community of enthusiasts who share your interests.
    </p>
  `;
}

function renderPopularHobbies(hobbies) {
  const grid = document.getElementById("popularHobbyGrid");
  if (!grid) {
    console.error("popularHobbyGrid not found in HTML.");
    return;
  }

  if (!Array.isArray(hobbies) || hobbies.length === 0) {
    grid.innerHTML = `<p style="width:100%; text-align:center; color:#666;">No hobbies available.</p>`;
    return;
  }

  grid.innerHTML = hobbies
    .map(
      (hobby) => `
      <div class="hobby-card" onclick="location.href='hobby.html?name=${encodeURIComponent(hobby.name)}'" style="cursor: pointer;">
        <img src="${escapeAttr(hobby.icon)}" alt="${escapeAttr(hobby.name)}" />
        <p>${escapeHtml(hobby.name)}</p>
      </div>
    `
    )
    .join("");
}

function initQuizIfAvailable() {
  if (typeof startQuiz === "function") {
    try {
      startQuiz();
    } catch (err) {
      console.warn("startQuiz() exists but threw an error:", err);
    }
  } else if (typeof initQuiz === "function") {
    try {
      initQuiz();
    } catch (err) {
      console.warn("initQuiz() exists but threw an error:", err);
    }
  } else {
  }
}

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export function escapeAttr(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
