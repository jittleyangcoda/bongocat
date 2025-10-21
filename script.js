//fetch the game list
fetch('games.json')
  .then(response => response.json())
  .then(data => {
    const gameList = document.getElementById('gameList');
    data.forEach(game => {
      const li = document.createElement('li');
      const liInfo = document.createElement('a');
      liInfo.className = 'game-item'
      liInfo.href = game.url;
      liInfo.textContent = game.title;
      gameList.appendChild(li);
      li.appendChild(liInfo);
    });
  })
  .catch(error => console.error('Error fetching game list:', error));