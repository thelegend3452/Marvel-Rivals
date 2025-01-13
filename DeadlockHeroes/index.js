document.addEventListener('DOMContentLoaded', function() {
  Promise.all([
      fetch('patchNotes.json').then(response => response.json()),
      fetch('heroes.json').then(response => response.json())
  ])
  .then(([patchData, heroData]) => {
      const container = document.getElementById('patch-notes-container');

      container.innerHTML = `
        <h2>${patchData.title}</h2>
        <p><strong>Release Date:</strong> ${patchData.releaseDate}</p>
        <p>${patchData.summary}</p>
      `;

      Object.keys(patchData.heroes).forEach(category => {
          const section = document.createElement('section');
          section.innerHTML = `<h3>${category}</h3>`;
          patchData.heroes[category].forEach(hero => {
              const heroDetails = heroData.heroes[hero.name];  
              const heroElement = document.createElement('div');
              heroElement.classList.add('hero');
              heroElement.innerHTML = `
                <h4>${hero.name}</h4>
                <img src="${heroDetails.image}" alt="${hero.name}" class="hero-image"/>
                <p>${heroDetails.description}</p>
                <ul>
                  ${hero.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
              `;
              section.appendChild(heroElement);
          });
          container.appendChild(section);
      });
      
      const teamUpSection = document.createElement('section');
      teamUpSection.innerHTML = `<h3>Team-Up Abilities</h3>`;
      patchData.teamUpAbilities.forEach(teamUp => {
          const teamUpDetails = heroData.teamUps[teamUp.teamUp];

          if (teamUpDetails && teamUpDetails.images) {
              const teamUpElement = document.createElement('div');
              teamUpElement.classList.add('team-up');
              teamUpElement.innerHTML = `
                <h4>${teamUp.teamUp}</h4>
                <div class="team-up-images">
                  ${teamUpDetails.images.map(image => `<img src="${image}" alt="${teamUp.teamUp}" class="team-up-image"/>`).join('')}
                </div>
                <p>${teamUpDetails.description || ''}</p>
                <ul>
                  ${teamUp.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
              `;
              teamUpSection.appendChild(teamUpElement);
          } else {
              console.warn(`Missing details for team-up: ${teamUp.teamUp}`);
          }
      });
      container.appendChild(teamUpSection);
  })
  .catch(error => console.error('Error loading patch notes:', error));
});
