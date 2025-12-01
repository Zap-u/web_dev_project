import { escapeHtml, escapeAttr } from "./index.js";

export function loadHobbyPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const hobbyName = urlParams.get("name");

  if (!hobbyName) {
    renderError(
      "No hobby specified. Please select a hobby from the hobbies page."
    );
    return;
  }

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

      const hobby = allHobbies.find(
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

  const aboutText =
    hobby.about ||
    `Discover the world of ${escapeHtml(
      hobby.name.toLowerCase()
    )} and explore new possibilities. This hobby offers a great way to express yourself, learn new skills, and connect with others who share your interests.`;

  const gettingStartedText =
    hobby.gettingStarted ||
    `Ready to dive into ${escapeHtml(
      hobby.name.toLowerCase()
    )}? Start by exploring the basics and finding resources that match your interests and skill level.`;

  let toolsHtml = "";
  if (Array.isArray(hobby.tools) && hobby.tools.length > 0) {
    const items = hobby.tools
      .map((tool) => `<li>${escapeHtml(tool)}</li>`)
      .join("");

    toolsHtml = `
      <section class="hobby-section">
        <h2>Tools &amp; Resources</h2>
        <ul class="hobby-tools">
          ${items}
        </ul>
      </section>
    `;
  } else {
    toolsHtml = `
      <section class="hobby-section">
        <h2>Tools &amp; Resources</h2>
        <p>
          Look for beginner-friendly tools, apps, videos, and local groups
          related to ${escapeHtml(
            hobby.name.toLowerCase()
          )}. Online tutorials, campus clubs, and community classes are all
          great ways to get extra support.
        </p>
      </section>
    `;
  }

  let clubsHtml = "";
  if (Array.isArray(hobby.bcClubs) && hobby.bcClubs.length > 0) {
    const clubItems = hobby.bcClubs
      .map((club) => `<li>${escapeHtml(club)}</li>`)
      .join("");

    clubsHtml = `
      <section class="hobby-section">
        <h2>BC Clubs &amp; Communities</h2>
        <p style="margin-bottom: 10px;">
          Interested in exploring ${escapeHtml(
            hobby.name.toLowerCase()
          )} with others? These Boston College clubs may be a good fit:
        </p>
        <ul class="hobby-clubs">
          ${clubItems}
        </ul>
      </section>
    `;
  }

  container.innerHTML = `
    <div class="hobby-header">
      <div class="hobby-icon-wrapper">
        <img src="${escapeAttr(hobby.icon)}" alt="${escapeAttr(
    hobby.name
  )}" class="hobby-icon" />
      </div>
      <h1 class="hobby-title">${escapeHtml(hobby.name)}</h1>
    </div>

    <div class="hobby-details">
      <section class="hobby-section">
        <h2>About ${escapeHtml(hobby.name)}</h2>
        <p>${escapeHtml(aboutText)}</p>
      </section>

      <section class="hobby-section">
        <h2>Getting Started</h2>
        <p>${escapeHtml(gettingStartedText)}</p>
      </section>

      ${toolsHtml}
      ${clubsHtml}
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
