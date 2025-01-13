document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://mrapi.org/api/heroes'; 
    const heroContainer = document.getElementById('hero-container');
  
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        data.forEach(hero => {
          const heroDiv = document.createElement('div');
          heroDiv.className = 'hero';
  
          const heroImage = document.createElement('img');
          heroImage.src = hero.images[0];
          heroImage.alt = hero.title;
  
          const heroTitle = document.createElement('h2');
          heroTitle.textContent = hero.title;
  
          const heroLink = document.createElement('a');
          heroLink.href = hero.url;
          heroLink.textContent = 'Read more';
          heroLink.target = '_blank'; // Open in a new tab
  
          heroDiv.appendChild(heroImage);
          heroDiv.appendChild(heroTitle);
          heroDiv.appendChild(heroLink);
  
          heroContainer.appendChild(heroDiv);
        });
      })
      .catch(error => {
        console.error('Error fetching heroes:', error);
      });
  });
  