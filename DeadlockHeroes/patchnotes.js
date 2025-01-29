document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const patchId = params.get('patchId');
  const dropdownMenu = document.getElementById('patch-dropdown');
  const container = document.getElementById('patch-notes-container');

  Promise.all([
    fetch('patchNotes.json').then(response => response.json()),
    fetch('heroes.json').then(response => response.json())
  ])
    .then(([patchData, heroData]) => {
      const patches = patchData.patches;

      if (!patches || patches.length === 0) {
        dropdownMenu.innerHTML = `<option>No patches available</option>`;
        container.innerHTML = `<p>No patches found.</p>`;
        return;
      }

      patches.forEach(patch => {
        const option = document.createElement('option');
        option.value = patch.patchId;
        option.textContent = patch.title;
        dropdownMenu.appendChild(option);
      });

      const selectedPatch = patchId
        ? patches.find(patch => patch.patchId === patchId)
        : patches[0];

      if (!selectedPatch) {
        container.innerHTML = `<p>Patch not found.</p>`;
        return;
      }

      dropdownMenu.value = selectedPatch.patchId;

      const displayPatchDetails = patch => {
        container.innerHTML = `
          <h2>${patch.title}</h2>
          <p><strong>Release Date:</strong> ${patch.releaseDate}</p>
          <p>${patch.summary}</p>
        `;

        if (patch.content) {
          patch.content.forEach(section => {
            const sectionElement = document.createElement('section');
            sectionElement.innerHTML = `<h3>${section.sectionTitle}</h3>`;
            section.content.forEach(item => {
              const itemElement = document.createElement('div');
              itemElement.innerHTML = `
                <h4>${item.title}</h4>
                <ul>
                  ${item.details
                    .map(detail => getStyledChangeWithImages(detail, heroData))
                    .join('')}
                </ul>
              `;
              sectionElement.appendChild(itemElement);
            });
            container.appendChild(sectionElement);
          });
        } else {
          container.innerHTML += `<p>No additional content available for this patch.</p>`;
        }

        if (patch.heroes && Object.keys(patch.heroes).length > 0) {
          Object.keys(patch.heroes).forEach(category => {
            const section = document.createElement('section');
            section.innerHTML = `<h3>${category}</h3>`;
            patch.heroes[category].forEach(hero => {
              const heroDetails = heroData.heroes[hero.name];
              const heroElement = document.createElement('div');
              heroElement.classList.add('hero');
              heroElement.innerHTML = `
                <h4>${hero.name}</h4>
                <img src="${heroDetails?.image || 'default-image.jpg'}" alt="${hero.name}" class="hero-image"/>
                <p>${heroDetails?.description || 'No description available.'}</p>
                <ul>
                  ${hero.changes.map(change => getStyledChange(change)).join('')}
                </ul>
              `;
              section.appendChild(heroElement);
            });
            container.appendChild(section);
          });
        } else {
          container.innerHTML += `<p>No hero changes for this patch.</p>`;
        }

        const teamUpSection = document.createElement('section');
        teamUpSection.innerHTML = `<h3>Team-Up Abilities</h3>`;
        if (patch.teamUpAbilities && patch.teamUpAbilities.length > 0) {
          patch.teamUpAbilities.forEach(teamUp => {
            const teamUpDetails = heroData.teamUps?.[teamUp.teamUp];
            const teamUpElement = document.createElement('div');
            teamUpElement.classList.add('team-up');
            teamUpElement.innerHTML = `
              <h4>${teamUp.teamUp}</h4>
              <div class="team-up-images">
                ${
                  teamUpDetails?.images
                    ? teamUpDetails.images
                        .map(image => `<img src="${image}" alt="${teamUp.teamUp}" class="team-up-image" />`)
                        .join('')
                    : '<p>No images available</p>'
                }
              </div>
              <ul>
                ${teamUp.changes.map(change => getStyledChange(change)).join('')}
              </ul>
            `;
            teamUpSection.appendChild(teamUpElement);
          });
        } else {
          teamUpSection.innerHTML += `<p>No team-up changes for this patch.</p>`;
        }
        container.appendChild(teamUpSection);
      };

      const getStyledChangeWithImages = (change, heroData) => {
        const buffKeywords = /increase|reduce delay|reduce cooldown/i;
        const nerfKeywords = /reduce|decrease|falloff`|increase cooldown/i;

        const heroName = Object.keys(heroData.heroes).find(hero =>
          change.includes(hero)
        );
        const heroDetails = heroName ? heroData.heroes[heroName] : null;

        const imageTag = heroDetails
          ? `<img src="${heroDetails.image || 'default-image.jpg'}" alt="${heroName}" class="inline-hero-image">`
          : '';

        if (buffKeywords.test(change)) {
          return `
            <li class="buff">
              <span>&#9650;</span>
              <span>BUFF</span>
              ${imageTag}
              <span class="change-text">${change}</span>
            </li>
          `;
        } else if (nerfKeywords.test(change)) {
          return `
            <li class="nerf">
              <span>&#9660;</span>
              <span>NERF</span>
              ${imageTag}
              <span class="change-text">${change}</span>
            </li>
          `;
        } else {
          return `<li>${imageTag}<span class="change-text">${change}</span></li>`;
        }
      };

      const getStyledChange = change => {
        const buffKeywords = /increase|reduce delay|reduce cooldown/i;
        const nerfKeywords = /reduce|decrease|falloff|increase cooldown/i;

        if (buffKeywords.test(change)) {
          return `
            <li class="buff">
              <span>&#9650;</span>
              <span>BUFF</span>
              <span class="change-text">${change}</span>
            </li>
          `;
        } else if (nerfKeywords.test(change)) {
          return `
            <li class="nerf">
              <span>&#9660;</span>
              <span>NERF</span>
              <span class="change-text">${change}</span>
            </li>
          `;
        } else {
          return `<li><span class="change-text">${change}</span></li>`;
        }
      };

      displayPatchDetails(selectedPatch);

      dropdownMenu.addEventListener('change', event => {
        const selectedId = event.target.value;
        const newSelectedPatch = patches.find(patch => patch.patchId === selectedId);
        if (newSelectedPatch) {
          displayPatchDetails(newSelectedPatch);
        }
      });
    })
    .catch(error => console.error('Error loading patch notes:', error));
});
