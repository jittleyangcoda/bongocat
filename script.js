const path = window.location.pathname;
const isIndex =
  path.endsWith("index.html") || path === "/" || path === "";

if (isIndex) {
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
  console.log("Running index-only script");
} else {
  (() => {
    const HOTKEY = '`'; // backtick key to toggle overlay

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 40vh;
    background: rgba(0, 0, 0, 0.85);
    color: #00ff88;
    font-family: monospace;
    font-size: 12px;
    overflow-y: auto;
    padding: 8px;
    box-sizing: border-box;
    z-index: 999999;
    display: none;
    border-top: 1px solid #00ff88;
    white-space: pre-wrap;
  `;
    document.body.appendChild(overlay);

    // Helper to add lines
    function addLine(text, color) {
      const line = document.createElement('div');
      line.style.color = color;
      line.textContent = text;
      overlay.appendChild(line);
      overlay.scrollTop = overlay.scrollHeight;
    }

    // Hook console methods
    ['log', 'warn', 'error'].forEach(type => {
      const orig = console[type];
      console[type] = (...args) => {
        orig.apply(console, args);
        const msg = args.map(a =>
          typeof a === 'object' ? JSON.stringify(a, null, 2) : a
        ).join(' ');
        addLine(`[${type.toUpperCase()}] ${msg}`,
          type === 'error' ? '#ff4444' : type === 'warn' ? '#ffcc00' : '#00ff88');
      };
    });

    // Toggle visibility with a hotkey
    document.addEventListener('keydown', e => {
      if (e.key === HOTKEY) {
        overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Optional: startup message
    console.log('✅ Console overlay initialized — press `' + HOTKEY + '` to toggle');
  })();
}