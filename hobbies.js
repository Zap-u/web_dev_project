const CATEGORY_DEFINITIONS = [
  {
    title: "Sports & Fitness",
    hobbyNames: ["Fitness", "Running", "Yoga"],
  },
  {
    title: "Arts & Crafts",
    hobbyNames: ["Painting", "Crafting", "Cooking"],
  },
  {
    title: "Books & Visual Media",
    hobbyNames: ["Photography", "Reading", "Journaling"],
  },
  {
    title: "Games & Puzzles",
    hobbyNames: ["Gaming", "Board Games", "Puzzles"],
  },
  {
    title: "Music & Performing Arts",
    hobbyNames: ["Music", "Singing", "Dance"],
  },
];

function getShortDescription(aboutText) {
  if (!aboutText) return "";
  const firstSentence = aboutText.split(".")[0].trim();
  return firstSentence ? firstSentence + "." : aboutText;
}

function findHobbyByName(data, name) {
  const all = [
    ...(data.home?.popularHobbies || []),
    ...(data.home?.extraHobbies || []),
  ];
  return all.find((h) => h.name === name) || null;
}

// This will be called from hobbies.html
export function loadHobbiesPage() {
  const root = document.getElementById("hobbiesRoot");
  if (!root) return;

  fetch("data.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data.json");
      return res.json();
    })
    .then((data) => {
      // --- Build Explore + Search section ---
      const exploreSection = document.createElement("section");
      exploreSection.className = "explore-section";
      exploreSection.innerHTML = `
          <div class="explore-card">
            <div class="explore-text">
              <h2>Explore All Hobbies</h2>
              <p>Browse our catalog of hobbies by category or search by name.</p>
            </div>
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search hobbies..."
                aria-label="Search hobbies"
              />
            </div>
          </div>
        `;
      root.appendChild(exploreSection);

      const searchInput = exploreSection.querySelector("input");

      // --- Build Category sections from definitions + data.json ---
      CATEGORY_DEFINITIONS.forEach((category) => {
        const section = document.createElement("section");
        section.className = "category-section";

        const header = document.createElement("div");
        header.className = "category-header";

        const titleWrap = document.createElement("div");
        titleWrap.className = "category-title";

        const title = document.createElement("h3");
        title.textContent = category.title;

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = category.hobbyNames.length.toString();

        titleWrap.appendChild(title);
        titleWrap.appendChild(badge);
        header.appendChild(titleWrap);
        section.appendChild(header);

        const grid = document.createElement("div");
        grid.className = "cards-grid";

        category.hobbyNames.forEach((hobbyName) => {
          const hobbyData = findHobbyByName(data, hobbyName);
          if (!hobbyData) {
            console.warn("Hobby not found in data.json:", hobbyName);
            return;
          }

          const card = document.createElement("article");
          card.className = "hobby-card";
          card.dataset.hobbyName = hobbyData.name;
          card.style.cursor = "pointer";

          const h4 = document.createElement("h4");
          h4.textContent = hobbyData.name;

          const p = document.createElement("p");
          p.textContent = getShortDescription(hobbyData.about);

          card.appendChild(h4);
          card.appendChild(p);

          card.addEventListener("click", () => {
            const url = `hobby.html?name=${encodeURIComponent(hobbyData.name)}`;
            window.location.href = url;
          });

          grid.appendChild(card);
        });

        section.appendChild(grid);
        root.appendChild(section);
      });

      // --- Search/filter logic ---
      const allSections = Array.from(
        root.querySelectorAll(".category-section")
      );
      const allCards = Array.from(root.querySelectorAll(".hobby-card"));

      if (searchInput) {
        searchInput.addEventListener("input", () => {
          const query = searchInput.value.trim().toLowerCase();

          allSections.forEach((section) => {
            let visibleCountInSection = 0;
            const cards = Array.from(section.querySelectorAll(".hobby-card"));

            cards.forEach((card) => {
              const name = card.querySelector("h4").textContent.toLowerCase();
              const desc = card.querySelector("p").textContent.toLowerCase();
              const matches = name.includes(query) || desc.includes(query);

              card.style.display = matches ? "" : "none";
              if (matches) visibleCountInSection++;
            });

            // Hide section if no cards match
            section.style.display = visibleCountInSection === 0 ? "none" : "";
          });
        });
      }
    })
    .catch((err) => {
      console.error("Error loading hobbies page:", err);
      if (root) {
        root.innerHTML =
          "<p>Sorry, we couldn't load the hobbies right now.</p>";
      }
    });
}
