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

// Pull hobby data by name from data.json
function findHobbyByName(data, name) {
  const all = [
    ...(data.home?.popularHobbies || []),
    ...(data.home?.extraHobbies || []),
  ];
  return all.find((h) => h.name === name) || null;
}

// Main rendering function — called from hobbies.html
export function loadHobbiesPage() {
  const root = document.getElementById("hobbiesRoot");
  if (!root) return;

  fetch("data.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load data.json");
      return res.json();
    })
    .then((data) => {
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

      CATEGORY_DEFINITIONS.forEach((category) => {
        const section = document.createElement("section");
        section.className = "category-section";

        // Header
        const header = document.createElement("div");
        header.className = "category-header";

        const titleWrap = document.createElement("div");
        titleWrap.className = "category-title";

        const h3 = document.createElement("h3");
        h3.textContent = category.title;

        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = category.hobbyNames.length;

        titleWrap.appendChild(h3);
        titleWrap.appendChild(badge);
        header.appendChild(titleWrap);

        section.appendChild(header);

        // Card grid
        const grid = document.createElement("div");
        grid.className = "cards-grid";

        category.hobbyNames.forEach((name) => {
          const hobby = findHobbyByName(data, name);
          if (!hobby) {
            console.warn("Missing hobby in data.json:", name);
            return;
          }

          // Create card
          const card = document.createElement("article");
          card.className = "hobby-card";
          card.dataset.hobbyName = hobby.name;
          card.style.cursor = "pointer";

          // Title
          const h4 = document.createElement("h4");
          h4.textContent = hobby.name;

          // Short description from summary field
          const p = document.createElement("p");
          p.textContent = hobby.summary || "";

          card.appendChild(h4);
          card.appendChild(p);

          // Link to hobby page
          card.addEventListener("click", () => {
            window.location.href = `hobby.html?name=${encodeURIComponent(
              hobby.name
            )}`;
          });

          grid.appendChild(card);
        });

        section.appendChild(grid);
        root.appendChild(section);
      });

      const sections = Array.from(root.querySelectorAll(".category-section"));
      const cards = Array.from(root.querySelectorAll(".hobby-card"));

      searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();

        sections.forEach((section) => {
          let visibleCount = 0;
          const sectionCards = Array.from(
            section.querySelectorAll(".hobby-card")
          );

          sectionCards.forEach((card) => {
            const name = card.querySelector("h4").textContent.toLowerCase();
            const desc = card.querySelector("p").textContent.toLowerCase();

            const match =
              name.includes(query) || desc.includes(query) || query === "";

            card.style.display = match ? "" : "none";
            if (match) visibleCount++;
          });

          // Hide category if no cards match search
          section.style.display = visibleCount > 0 ? "" : "none";
        });
      });
    })
    .catch((err) => {
      console.error("Error loading hobbies page:", err);
      root.innerHTML = "<p>Sorry, we couldn't load hobbies at the moment.</p>";
    });
}
