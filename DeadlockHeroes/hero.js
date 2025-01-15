document.addEventListener('DOMContentLoaded', function () {
  const dropdownMenu = document.getElementById('patch-dropdown');
  const heroContainer = document.getElementById('hero-container');
  const comparisonContainer = document.getElementById('comparison-container');

  Promise.all([
    fetch('patchNotes.json').then(response => response.json()),
    fetch('heroes.json').then(response => response.json())
  ])
    .then(([patchData, heroData]) => {
      const patches = patchData.patches;

      if (!patches || patches.length === 0) {
        dropdownMenu.innerHTML = `<option>No patches available</option>`;
        comparisonContainer.innerHTML = `<p>No patches found.</p>`;
        return;
      }

      dropdownMenu.innerHTML = `<option value="">Select a Patch</option>`;
      patches.forEach(patch => {
        const option = document.createElement('option');
        option.value = patch.patchId;
        option.textContent = patch.title;
        dropdownMenu.appendChild(option);
      });

      const displayAllHeroes = () => {
        heroContainer.innerHTML = '';
        for (const [name, hero] of Object.entries(heroData.heroes)) {
          const heroDiv = document.createElement('div');
          heroDiv.classList.add('hero-card');
          heroDiv.innerHTML = `
            <img src="${hero.image}" alt="${name}" class="hero-image">
            <h4>${name}</h4>
            <p>${hero.description || 'No description available.'}</p>
          `;
          heroContainer.appendChild(heroDiv);
        }
      };

      // Display hero changes for a specific patch
      const displayHeroChanges = patch => {
        comparisonContainer.innerHTML = `<h2>Hero Changes in ${patch.title}</h2>`;
        if (patch.heroes && Object.keys(patch.heroes).length > 0) {
          Object.keys(patch.heroes).forEach(category => {
            const heroList = patch.heroes[category];
            heroList.forEach(hero => {
              const heroDetails = heroData.heroes[hero.name];
              const heroElement = document.createElement('div');
              heroElement.classList.add('hero-card');
              heroElement.innerHTML = `
                <h4>${hero.name}</h4>
                <img src="${heroDetails?.image || 'default-image.jpg'}" alt="${hero.name}" class="hero-image">
                <p>${heroDetails?.description || 'No description available.'}</p>
                <ul>
                  ${hero.changes.map(change => `<li>${change}</li>`).join('')}
                </ul>
              `;
              comparisonContainer.appendChild(heroElement);
            });
          });
        } else {
          comparisonContainer.innerHTML += `<p>No hero changes in this patch.</p>`;
        }
      };

      displayAllHeroes();

      dropdownMenu.addEventListener('change', event => {
        const selectedPatchId = event.target.value;
        if (selectedPatchId) {
          const selectedPatch = patches.find(patch => patch.patchId === selectedPatchId);
          if (selectedPatch) {
            displayHeroChanges(selectedPatch);
          }
        } else {
          comparisonContainer.innerHTML = '';
          displayAllHeroes();
        }
      });
    })
    .catch(error => console.error('Error loading data:', error));
});
