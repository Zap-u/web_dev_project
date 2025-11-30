import { escapeHtml, escapeAttr } from "./index.js";

export function loadHobbyPage() {
  // Get hobby name from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const hobbyName = urlParams.get("name");

  if (!hobbyName) {
    renderError("No hobby specified. Please select a hobby from the hobbies page.");
    return;
  }

  // Load data from data.json
  fetch("data.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data.json");
      return res.json();
    })
    .then((data) => {
      // Find the hobby in popularHobbies
      const hobby = data.home?.popularHobbies?.find(
        (h) => h.name.toLowerCase() === hobbyName.toLowerCase()
      );

      if (!hobby) {
        renderError(`Hobby "${escapeHtml(hobbyName)}" not found.`);
        return;
      }

      renderHobbyPage(hobby);
    })
    .catch((err) => {
      console.error("Error loading hobby data:", err);
      renderError("Failed to load hobby information. Please try again later.");
    });
}

function renderHobbyPage(hobby) {
  const container = document.getElementById("hobbyContent");
  if (!container) {
    console.error("hobbyContent container not found");
    return;
  }

  container.innerHTML = `
    <div class="hobby-header">
      <div class="hobby-icon-wrapper">
        <img src="${escapeAttr(hobby.icon)}" alt="${escapeAttr(hobby.name)}" class="hobby-icon" />
      </div>
      <h1 class="hobby-title">${escapeHtml(hobby.name)}</h1>
    </div>

    <div class="hobby-details">
      <section class="hobby-section">
        <h2>About ${escapeHtml(hobby.name)}</h2>
        <p>Discover the world of ${escapeHtml(hobby.name.toLowerCase())} and explore new possibilities. This hobby offers a great way to express yourself, learn new skills, and connect with others who share your interests.</p>
      </section>

      <section class="hobby-section">
        <h2>Getting Started</h2>
        <p>Ready to dive into ${escapeHtml(hobby.name.toLowerCase())}? Start by exploring the basics and finding resources that match your interests and skill level.</p>
      </section>
    </div>
  `;
}

function renderError(message) {
  const container = document.getElementById("hobbyContent");
  if (!container) {
    console.error("hobbyContent container not found");
    return;
  }

  container.innerHTML = `
    <div class="error-message">
      <h2>Oops!</h2>
      <p>${escapeHtml(message)}</p>
      <button onclick="location.href='hobbies.html'" class="back-button">
        Browse All Hobbies
      </button>
    </div>
  `;
}

