// ==================================================
// In-Page Console Overlay (toggle with backtick ` )
// ==================================================

(function () {
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

  console.log("[Overlay Console] Loaded. Press ` to toggle.");
})();


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
// EmulatorJS IndexedDB Save System
// ==========================================

// Create IndexedDB for EmulatorJS saves
const DB_NAME = "EJS_Saves_DB";
const STORE_NAME = "game_saves";

// Open IndexedDB connection
let dbPromise = new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "gameID" });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = (e) => reject(e);
});

// Helper functions
async function saveToIndexedDB(gameID, data, hash) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put({
    gameID,
    data,
    hash,
    timestamp: Date.now(),
  });
  return tx.complete;
}

async function loadFromIndexedDB(gameID) {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve) => {
    const req = store.get(gameID);
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = () => resolve(null);
  });
}

// ==========================================
// EmulatorJS Hook Integration
// ==========================================

// Get current game identifier (you can customize this)
const EJS_gameID = new URLSearchParams(window.location.search).get("game") || "default_game";

// Triggered when a save file changes
EJS_onSaveUpdate = async function (info) {
  console.log("[EJS] Save updated. Hash:", info.hash);

  // Convert save buffer (ArrayBuffer) → Base64 for storage
  const base64 = arrayBufferToBase64(info.save);

  // Save to IndexedDB
  await saveToIndexedDB(EJS_gameID, base64, info.hash);
  console.log("[EJS] Save persisted to IndexedDB!");
};

// Optional: auto flush saves every 5 seconds
EJS_fixedSaveInterval = 5000;

// ==========================================
// On Page Load: Restore Save
// ==========================================
(async () => {
  const savedData = await loadFromIndexedDB(EJS_gameID);
  if (savedData) {
    console.log("[EJS] Found saved data for", EJS_gameID);
    const binary = base64ToArrayBuffer(savedData);

    // Feed save into emulator when available
    window.addEventListener("EJS_ready", () => {
      console.log("[EJS] Restoring save...");
      EJS_emulator.setSaveFile(binary);
    });
  } else {
    console.log("[EJS] No previous save found.");
  }
})();

// ==========================================
// Utility functions
// ==========================================
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// === Initialize ===
window.addEventListener("DOMContentLoaded", () => {
  initConsoleOverlay();

  const path = window.location.pathname;
  const isIndex =
    path.endsWith("/") || path === "";
    console.log("Current path:", path, "isIndex:", isIndex);

  if (isIndex) {
    runIndexFeatures();
  }
});
