// ==================================================
// In-Page Console Overlay (toggle with backtick ` )
// ==================================================

function initConsoleOverlay() {
  const overlay = document.createElement("div");
  const logContainer = document.createElement("div");
  const input = document.createElement("input");

  // --- Styles ---
  Object.assign(overlay.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    height: "30%",
    background: "rgba(20, 20, 20, 0.95)",
    color: "#00ff88",
    fontFamily: "monospace",
    display: "none",
    flexDirection: "column",
    zIndex: 999999,
    borderTop: "2px solid #00ff88",
  });

  Object.assign(logContainer.style, {
    flex: "1",
    overflowY: "auto",
    padding: "5px",
  });

  Object.assign(input.style, {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "5px",
    background: "rgba(0, 0, 0, 0.8)",
    color: "#00ff88",
    fontFamily: "monospace",
  });

  overlay.appendChild(logContainer);
  overlay.appendChild(input);
  document.body.appendChild(overlay);

  // --- Show/Hide toggle ---
  window.addEventListener("keydown", (e) => {
    if (e.key === "`") {
      overlay.style.display =
        overlay.style.display === "none" ? "flex" : "none";
      if (overlay.style.display === "flex") input.focus();
    }
  });

  // --- Add message to overlay ---
  function addLog(type, msg) {
    const line = document.createElement("div");
    line.style.whiteSpace = "pre-wrap";
    if (type === "error") line.style.color = "#ff4444";
    if (type === "warn") line.style.color = "#ffaa00";
    line.textContent = msg;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // --- Hook into console methods ---
  const origLog = console.log;
  const origWarn = console.warn;
  const origErr = console.error;

  console.log = (...args) => {
    origLog(...args);
    addLog("log", args.join(" "));
  };

  console.warn = (...args) => {
    origWarn(...args);
    addLog("warn", args.join(" "));
  };

  console.error = (...args) => {
    origErr(...args);
    addLog("error", args.join(" "));
  };

  // --- Command input handler ---
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();
      if (!cmd) return;
      addLog("log", "> " + cmd);
      try {
        const result = eval(cmd);
        if (result !== undefined) addLog("log", "< " + result);
      } catch (err) {
        addLog("error", err);
      }
      input.value = "";
    }
  });

  console.log("[Overlay Console] Loaded. Press ` to toggle.")
  // 🔮 --- Autocomplete Setup ---
  let suggestions = Object.getOwnPropertyNames(window);
  let filtered = [];
  let index = -1;

  const suggestionBox = document.createElement("div");
  suggestionBox.style.position = "absolute";
  suggestionBox.style.background = "rgba(30,30,30,0.9)";
  suggestionBox.style.color = "#0f0";
  suggestionBox.style.padding = "4px";
  suggestionBox.style.fontSize = "14px";
  suggestionBox.style.fontFamily = "monospace";
  suggestionBox.style.zIndex = "10000";
  suggestionBox.style.display = "none";
  overlay.appendChild(suggestionBox);

  input.addEventListener("input", () => {
    const val = input.value.trim();
    suggestionBox.innerHTML = "";
    filtered = [];

    if (!val) {
      suggestionBox.style.display = "none";
      return;
    }

    // match window properties or global functions
    filtered = suggestions.filter((s) => s.startsWith(val)).slice(0, 8);
    if (filtered.length === 0) {
      suggestionBox.style.display = "none";
      return;
    }

    suggestionBox.style.display = "block";
    suggestionBox.style.top = input.offsetTop - 120 + "px";
    suggestionBox.style.left = input.offsetLeft + "px";
    filtered.forEach((s, i) => {
      const el = document.createElement("div");
      el.textContent = s;
      el.style.padding = "2px 6px";
      el.style.cursor = "pointer";
      el.style.background = i === index ? "#333" : "transparent";
      el.addEventListener("click", () => {
        input.value = s;
        suggestionBox.style.display = "none";
      });
      suggestionBox.appendChild(el);
    });
  });

  // navigate suggestions
  input.addEventListener("keydown", (e) => {
    if (suggestionBox.style.display === "none") return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      index = (index + 1) % filtered.length;
      updateSuggestions();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      index = (index - 1 + filtered.length) % filtered.length;
      updateSuggestions();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (filtered[index]) {
        input.value = filtered[index];
        suggestionBox.style.display = "none";
      }
    }
  });

  function updateSuggestions() {
    const divs = suggestionBox.children;
    for (let i = 0; i < divs.length; i++) {
      divs[i].style.background = i === index ? "#333" : "transparent";
    }
  }
};


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

// ==========================================
// Utility functions
// ==========================================

// === Initialize ===
window.addEventListener("DOMContentLoaded", () => {
  initConsoleOverlay()
  const path = window.location.pathname;
  const isIndex =
    path.endsWith("/") || path === "";
    console.log("Current path:", path, "isIndex:", isIndex);

  if (isIndex) {
    runIndexFeatures();
  }
});
