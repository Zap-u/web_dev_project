export function renderNav(activePage) {
  const nav = document.getElementById("nav");

  nav.innerHTML = `
    <button onclick="location.href='index.html'" class="${
      activePage === "home" ? "active" : ""
    }">Home</button>
    <button onclick="location.href='hobbies.html'" class="${
      activePage === "hobbies" ? "active" : ""
    }">Hobbies</button>
    <button onclick="location.href='community.html'" class="${
      activePage === "community" ? "active" : ""
    }">Community</button>
  `;
}
