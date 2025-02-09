document.addEventListener('DOMContentLoaded', function () {
  const dropdownMenu = document.getElementById('patch-dropdown');
  const heroDropdown = document.getElementById('hero-dropdown');
  const heroContainer = document.getElementById('hero-container');
  const comparisonContainer = document.getElementById('comparison-container');
  const modal = document.getElementById('hero-modal');
  const modalClose = document.querySelector('.modal-close');

  Promise.all([
    fetch('patchNotes.json').then(response => response.json()),
    fetch('heroes.json').then(response => response.json())
  ])
  .then(([patchData, heroData]) => {
    const patches = patchData.patches;
    const roles = ['All', 'Tank', 'Strategist', 'FrontLine'];

   heroDropdown.innerHTML = roles
      .map(role => `<option value="${role}">${role}</option>`)
      .join('');

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

    const displayAllHeroes = (roleFilter = 'All') => {
      heroContainer.innerHTML = '';
      for (const [name, hero] of Object.entries(heroData.heroes)) {
        if (roleFilter === 'All' || hero.role === roleFilter) {
          const heroDiv = document.createElement('div');
          heroDiv.classList.add('hero-card');
          heroDiv.innerHTML = `
            <img src="${hero.image}" alt="${name}" class="hero-image">
            <h4>${name}</h4>
            <p id="rolename">Role: ${hero.role}</p>
          `;
          heroDiv.addEventListener('click', () => openModal(name, hero));
          heroContainer.appendChild(heroDiv);
        }
      }
    };

    const openModal = (heroName, hero) => {
      document.getElementById('modal-hero-image').src = hero.image;
      document.getElementById('modal-hero-name').textContent = heroName; 
      document.getElementById('modal-hero-description').textContent = hero.description || 'No description available.';
      document.getElementById('modal-hero-role').textContent = `Role: ${hero.role}`;

      const statsContainer = document.getElementById('modal-hero-stats');
      statsContainer.innerHTML = `
        <p><strong>Health:</strong> ${hero.stats.health}</p>
        <p><strong>Melee Damage:</strong> ${hero.stats.damage.melee_damage}</p>
        <p><strong>Max Distance:</strong> ${hero.stats.damage.maximum_distance}</p>
        <p><strong>Attack Speed:</strong> ${hero.stats.damage.attack_speed}</p>
        <p><strong>Travel Speed:</strong> ${hero.stats.traveling_speed}</p>
      `;

      const abilitiesList = document.getElementById('modal-hero-abilities');
      abilitiesList.innerHTML = ''; 

      if (hero.abilities) {
        for (const key in hero.abilities) {
          if (hero.abilities.hasOwnProperty(key)) {
            const ability = hero.abilities[key];

            const abilityDiv = document.createElement('div');
            abilityDiv.classList.add('ability-card');
            abilityDiv.innerHTML = `
              <h4>${ability.ability_name}</h4>
              <ul>
                ${Object.entries(ability.ability_stats)
                  .map(([statName, statValue]) => `<li><strong>${statName}:</strong> ${statValue}</li>`)
                  .join('')}
              </ul>
            `;

            abilitiesList.appendChild(abilityDiv);
          }
        }
      } else {
        abilitiesList.innerHTML = '<li>No abilities listed.</li>';
      }

      modal.style.display = 'block';
    };

    modalClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });

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

    heroDropdown.addEventListener('change', event => {
      const selectedRole = event.target.value;
      displayAllHeroes(selectedRole);
    });

  })
  .catch(error => console.error('Error loading data:', error));
});