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