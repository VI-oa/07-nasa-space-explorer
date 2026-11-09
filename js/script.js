const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');

// Keep a collection of space facts and show a different random one on each page load.
const spaceFacts = [
  'A day on Venus is longer than its year.',
  'Neutron stars can spin around 600 times per second.',
  'There are more stars in the universe than grains of sand on Earth.',
  'Jupiter has faint rings made mostly of dust.',
  'Footprints left by Apollo astronauts can last for millions of years on the Moon.',
  'The Sun contains about 99.8% of the mass in our solar system.'
];

const randomFactIndex = Math.floor(Math.random() * spaceFacts.length);
spaceFact.textContent = spaceFacts[randomFactIndex];

setupDateInputs(startInput, endInput);

getImagesButton.addEventListener('click', async () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert('Please choose both a start and end date.');
    return;
  }

  const dateFrom = startDate.replaceAll('-', '').slice(2);
  const dateTo = endDate.replaceAll('-', '').slice(2);
  const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?date_from=${dateFrom}&date_to=${dateTo}`;

  getImagesButton.disabled = true;
  gallery.innerHTML = '<p class="loading-message" role="status">🛰️🧑‍🚀🚀 Loading space photos…</p>';

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('NASA request failed');
    }

    const data = await response.json();
    renderGallery(data);
  } catch (error) {
    console.error(error);
    gallery.innerHTML = '<p class="loading-message" role="alert">Could not load space photos. Check your connection and try again.</p>';
  } finally {
    getImagesButton.disabled = false;
  }
});

function renderGallery(items) {
  if (!Array.isArray(items) || items.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🔭</div>
        <p>No space images found for that date range.</p>
      </div>
    `;
    return;
  }

  gallery.innerHTML = '';

  items.forEach((item) => {
    if (item.media_type !== 'image') {
      return;
    }

    const card = document.createElement('article');
    card.className = 'card';

    const image = document.createElement('img');
    image.src = item.hdurl || item.url;
    image.alt = item.title;
    image.className = 'card-image';

    const title = document.createElement('h2');
    title.textContent = item.title;

    const date = document.createElement('p');
    date.textContent = item.date;

    const description = document.createElement('p');
    description.textContent = getPlainText(item.explanation).slice(0, 120) + '...';

    card.addEventListener('click', () => openModal(item));

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(description);

    gallery.appendChild(card);
  });
}

function getPlainText(html) {
  const parsedHtml = new DOMParser().parseFromString(html, 'text/html');
  return parsedHtml.body.textContent.trim();
}

function openModal(item) {
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.textContent = '✕';
  closeButton.setAttribute('aria-label', 'Close image details');

  const image = document.createElement('img');
  image.src = item.hdurl || item.url;
  image.alt = item.title;
  image.className = 'modal-image';

  const title = document.createElement('h2');
  title.textContent = item.title;

  const date = document.createElement('p');
  date.textContent = item.date;
  date.className = 'modal-date';

  const explanation = document.createElement('p');
  explanation.textContent = getPlainText(item.explanation);
  explanation.className = 'modal-explanation';

  closeButton.addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });

  modalContent.appendChild(closeButton);
  modalContent.appendChild(image);
  modalContent.appendChild(title);
  modalContent.appendChild(date);
  modalContent.appendChild(explanation);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}
