// === Shared overlay code (runs on every page) ===
function initConsoleOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "consoleOverlay";
  overlay.style.position = "fixed";
  overlay.style.bottom = "10px";
  overlay.style.right = "10px";
  overlay.style.width = "300px";
  overlay.style.height = "200px";
  overlay.style.background = "rgba(0, 0, 0, 0.8)";
  overlay.style.color = "white";
  overlay.style.padding = "8px";
  overlay.style.fontFamily = "monospace";
  overlay.style.fontSize = "12px";
  overlay.style.overflowY = "auto";
  overlay.style.borderRadius = "10px";
  overlay.style.display = "none";
  overlay.style.zIndex = "9999";
  document.body.appendChild(overlay);

  // Hook console.log
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    overlay.innerHTML += args.join(" ") + "<br>";
    overlay.scrollTop = overlay.scrollHeight;
  };

  // Toggle overlay with a hotkey (e.g., ~ key)
  document.addEventListener("keydown", (e) => {
    if (e.key === "`") {
      overlay.style.display =
        overlay.style.display === "none" ? "block" : "none";
    }
  });

  console.log("[Overlay] Console overlay initialized");
}

// === Code that runs only on index.html ===
function runIndexFeatures() {
  console.log("Running index-specific features...");
  fetch('homework.json')
  .then(response => response.json())
  .then(data => {
    const homeworkList = document.getElementById('homeworkList');
    data.forEach(homework => {
      const li = document.createElement('li');
      const liInfo = document.createElement('a');
      liInfo.className = 'homework-item'
      liInfo.href = homework.url;
      liInfo.textContent = homework.title;
      homeworkList.appendChild(li);
      li.appendChild(liInfo);
    });
  })
  .catch(error => console.error('Error fetching homework list:', error));
}

// === Initialize ===
window.addEventListener("DOMContentLoaded", () => {
  initConsoleOverlay();

  const path = window.location.pathname;
  const isIndex =
    path.endsWith("index.html") || path === "/" || path === "";

  if (isIndex) {
    runIndexFeatures();
  }
});
