// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// --- Random Fact Logic ---
const spaceFacts = [
    "A day on Venus is longer than a year on Venus. It rotates very slowly.",
    "The footsteps left on the Moon by Apollo astronauts will likely remain there for at least 100 million years.",
    "There is a 'super-Earth' planet, 55 Cancri e, that is believed to be made largely of diamond.",
    "The largest volcano in our solar system is Olympus Mons on Mars; it's three times taller than Mount Everest.",
    "You can't burp in space because the lack of gravity prevents the gas in your stomach from separating from the liquid.",
    "Neutron stars are so dense that a spoonful of their material would weigh about the same as Mount Everest."
];

/**
 * Displays a random space fact on the page.
 */
function displayRandomFact() {
    const factTextElement = document.getElementById('random-fact-text');
    if (factTextElement) {
        const randomIndex = Math.floor(Math.random() * spaceFacts.length);
        factTextElement.textContent = spaceFacts[randomIndex];
    }
}
// --- End of Random Fact Logic ---


// Wait for the DOM to be ready before running setup
document.addEventListener('DOMContentLoaded', () => {
    // 1. Display the random fact on page load
    displayRandomFact();

    // 2. Get references to the button and the gallery container
    const getImageBtn = document.getElementById('getImageBtn');
    const gallery = document.getElementById('gallery');

    // 3. Add a click event listener to the button
    getImageBtn.addEventListener('click', fetchAndDisplayImages);

    // 4. Add a click event listener to the gallery (for modal)
    gallery.addEventListener('click', handleGalleryClick);
});


/**
 * Fetches data from the APOD JSON feed and displays it.
 */
async function fetchAndDisplayImages() {
    const gallery = document.getElementById('gallery'); // Get gallery reference

    // Show a loading message
    gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>`;

    try {
        // Fetch the data
        const response = await fetch(apodData);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Pass the data to the display function
        displayGallery(data);

    } catch (error) {
        // Handle errors
        console.error('Error fetching images:', error);
        gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🚫</div>
        <p>Error fetching images. Please try again later.</p>
      </div>`;
    }
}

/**
 * Displays the gallery items on the page.
 * @param {Array} data - An array of APOD data objects.
 */
function displayGallery(data) {
    const gallery = document.getElementById('gallery'); // Get gallery reference
    // Clear the loading message or placeholder
    gallery.innerHTML = '';

    if (!data || data.length === 0) {
        gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">🤷</div>
        <p>No images found.</p>
      </div>`;
        return;
    }

    // Loop through each item and create a gallery card
    data.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';

        // Store all the data for the modal using data-* attributes
        galleryItem.dataset.title = item.title;
        galleryItem.dataset.date = item.date;
        galleryItem.dataset.explanation = item.explanation;
        galleryItem.dataset.mediaType = item.media_type;
        galleryItem.dataset.hdurl = item.hdurl || item.url;
        galleryItem.dataset.displayUrl = item.media_type === 'video' ? item.url : (item.hdurl || item.url);

        // Handle media type (image vs. video)
        let mediaHtml = '';
        if (item.media_type === 'image') {
            mediaHtml = `<img src="${item.url}" alt="${item.title}" loading="lazy">`;
        } else if (item.media_type === 'video' && item.thumbnail_url) {
            // Show thumbnail for videos
            mediaHtml = `<img src="${item.thumbnail_url}" alt="Video: ${item.title}" loading="lazy">`;
        } else {
            // Fallback for items without a clear thumbnail
            mediaHtml = `<div class="media-placeholder">No preview available</div>`;
        }

        // Populate the gallery item
        galleryItem.innerHTML = `
      ${mediaHtml}
      <p><strong>${item.title}</strong></p>
      <p>${item.date}</p>
    `;

        // Append the item to the gallery
        gallery.appendChild(galleryItem);
    });
}

/**
 * Handles clicks within the gallery, opening a modal if a .gallery-item is clicked.
 * @param {Event} event - The click event object.
 */
function handleGalleryClick(event) {
    // Find the closest parent with the class 'gallery-item'
    const clickedItem = event.target.closest('.gallery-item');

    // If the click was not on a gallery item, do nothing
    if (!clickedItem) {
        return;
    }

    // Get the data from the data-* attributes
    const item = clickedItem.dataset;
    showModal(item);
    S}

/**
 * Creates and displays a modal with detailed information.
 * @param {object} item - An object containing the item's data (from dataset).
 */
function showModal(item) {
    // Create the modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    // Create the modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Handle media type for the modal display
    let modalMediaHtml = '';
    if (item.mediaType === 'image') {
        modalMediaHtml = `<img src="${item.displayUrl}" alt="${item.title}">`;
    } else if (item.mediaType === 'video') {
        // Embed video using an iframe
        modalMediaHtml = `<iframe src="${item.displayUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    // Populate the modal content
    modalContent.innerHTML = `
    <span class="modal-close-btn">&times;</span>
    <div class="modal-media">
      ${modalMediaHtml}
    </div>
    <h2>${item.title}</h2>
    <p class="modal-date">${item.date}</p>
    <p class="modal-explanation">${item.explanation}</p>
  `;

    // Append content to overlay, and overlay to body
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add event listeners to close the modal
    const closeBtn = modalOverlay.querySelector('.modal-close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });

    modalOverlay.addEventListener('click', (event) => {
        // Close only if the click is on the overlay itself, not the content
        if (event.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
}