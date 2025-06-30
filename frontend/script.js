// Constants
const API_BASE_URL = 'http://localhost:5000';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');

// Event listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Functions
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    searchResults.innerHTML = '<p>Searching...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');

        const books = await response.json();

        if (books.length === 0) {
            searchResults.innerHTML = '<p>No books found. Try a different search term.</p>';
            return;
        }

        displaySearchResults(books);
    } catch (error) {
        console.error('Error:', error);
        searchResults.innerHTML = '<p>An error occurred. Please try again later.</p>';
    }
}

function displaySearchResults(books) {
    searchResults.innerHTML = '';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.addEventListener('click', () => {
            window.location.href = `book.html?isbn=${book.ISBN}`;
        });

        const imageUrl = book['Image-URL-M'] || 'placeholder.jpg';

        bookCard.innerHTML = `
            <img src="${imageUrl}" alt="${book['Book-Title']}">
            <div class="book-info">
                <h3>${book['Book-Title']}</h3>
                <p>by ${book['Book-Author']}</p>
            </div>
        `;

        searchResults.appendChild(bookCard);
    });
}