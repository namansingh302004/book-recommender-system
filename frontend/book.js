// Constants
const API_BASE_URL = 'http://localhost:5000';
const bookDetailsContainer = document.getElementById('book-details');
const recommendationsContainer = document.getElementById('recommendations-container');

// Get ISBN from URL query parameters
const urlParams = new URLSearchParams(window.location.search);
const isbn = urlParams.get('isbn');

// Execute on page load
document.addEventListener('DOMContentLoaded', () => {
    if (!isbn) {
        window.location.href = 'index.html';
        return;
    }

    loadBookDetails();
});

// Functions
async function loadBookDetails() {
    try {
        // Fetch book details
        const response = await fetch(`${API_BASE_URL}/book/${isbn}`);
        if (!response.ok) throw new Error('Failed to load book details');

        const book = await response.json();
        displayBookDetails(book);

        // Fetch recommendations
        const recommendResponse = await fetch(`${API_BASE_URL}/recommend?title=${encodeURIComponent(book['Book-Title'])}`);
        if (!recommendResponse.ok) throw new Error('Failed to load recommendations');

        const recommendData = await recommendResponse.json();
        displayRecommendations(recommendData);

    } catch (error) {
        console.error('Error:', error);
        bookDetailsContainer.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}

function displayBookDetails(book) {
    // Update page title
    document.title = `${book['Book-Title']} | BookRecommender`;

    // Create book details HTML
    const imageUrl = book['Image-URL-L'] || book['Image-URL-M'] || 'placeholder.jpg';

    const bookDetailsHTML = `
        <div class="book-details-container">
            <div class="book-cover">
                <img src="${imageUrl}" alt="${book['Book-Title']}">
            </div>
            <div class="book-details-info">
                <h2>${book['Book-Title']}</h2>
                <h3>by ${book['Book-Author']}</h3>
                <div class="book-meta">
                    <p><strong>Published:</strong> ${book['Year-Of-Publication']} by ${book['Publisher']}</p>
                    <p><strong>ISBN:</strong> ${book.ISBN}</p>
                </div>
                <div class="book-description">
                    <p>This book is part of our extensive library. Browse through similar books or discover new recommendations below.</p>
                </div>
            </div>
        </div>
    `;

    bookDetailsContainer.innerHTML = bookDetailsHTML;
}

function displayRecommendations(data) {
    const { message, recommendations } = data;

    // Update section title if fallback recommendations
    if (message.includes('not found')) {
        document.querySelector('#recommendations-section h2').textContent = 'Popular Books You Might Like';
    }

    // Display recommendations
    recommendationsContainer.innerHTML = '';

    recommendations.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.addEventListener('click', () => {
            window.location.href = `book.html?isbn=${book.ISBN}`;
        });

        const imageUrl = book['Image-URL-M'] || 'placeholder.jpg';
        const rating = book.avg_rating ? `<p>Rating: ${book.avg_rating.toFixed(1)}/10</p>` : '';

        bookCard.innerHTML = `
            <img src="${imageUrl}" alt="${book['Book-Title']}">
            <div class="book-info">
                <h3>${book['Book-Title']}</h3>
                <p>by ${book['Book-Author']}</p>
                ${rating}
            </div>
        `;

        recommendationsContainer.appendChild(bookCard);
    });
}