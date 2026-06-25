// Constants
const API_BASE_URL = 'http://localhost:5000';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const resultsSection = document.getElementById('results-section');
const popularBooksContainer = document.getElementById('popular-books');

// Event listeners
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// Load popular books on startup
document.addEventListener('DOMContentLoaded', () => {
    loadTrendingBooks();
});

// Functions
async function loadTrendingBooks() {
    try {
        // Querying for a dummy title triggers the backend fallback to popular books
        const response = await fetch(`${API_BASE_URL}/recommend?title=popular_fallback_books`);
        if (!response.ok) throw new Error('Failed to load popular books');
        
        const data = await response.json();
        displayTrendingBooks(data.recommendations || []);
    } catch (error) {
        console.error('Error loading trending books:', error);
        popularBooksContainer.innerHTML = `
            <div class="message-container message-error">
                <span>✕</span>
                <p>Failed to load trending books. Verify the backend service is running.</p>
            </div>
        `;
    }
}

function displayTrendingBooks(books) {
    popularBooksContainer.innerHTML = '';
    
    if (books.length === 0) {
        popularBooksContainer.innerHTML = `
            <div class="message-container message-info">
                <span>ℹ</span>
                <p>No popular books available at this moment.</p>
            </div>
        `;
        return;
    }

    books.forEach(book => {
        const bookCard = createBookCard(book);
        popularBooksContainer.appendChild(bookCard);
    });
}

async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
        resultsSection.style.display = 'none';
        return;
    }

    resultsSection.style.display = 'block';
    searchResults.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Performing similarity index lookup...</p>
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search request failed');

        const books = await response.json();

        if (books.length === 0) {
            searchResults.innerHTML = `
                <div class="message-container message-info">
                    <span>ℹ</span>
                    <p>No books matching "${query}" were found. Try another query.</p>
                </div>
            `;
            return;
        }

        displaySearchResults(books);
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <div class="message-container message-error">
                <span>✕</span>
                <p>An error occurred while connecting to the index server. Please retry.</p>
            </div>
        `;
    }
}

function displaySearchResults(books) {
    searchResults.innerHTML = '';

    books.forEach(book => {
        const bookCard = createBookCard(book);
        searchResults.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.addEventListener('click', () => {
        window.location.href = `book.html?isbn=${book.ISBN}`;
    });

    const imageUrl = book['Image-URL-M'] || book['Image-URL-L'] || 'placeholder.jpg';
    
    // Clean up title by removing subtitle noise if it's too long
    let title = book['Book-Title'] || 'Untitled';
    
    const author = book['Book-Author'] || 'Unknown Author';
    
    // Check if we have rating or similarity info
    const rating = book.avg_rating 
        ? `<div class="book-rating-badge">${book.avg_rating.toFixed(1)} ★</div>` 
        : '';
        
    const similarity = book.similarity_score 
        ? `<div class="book-similarity-badge">${Math.round(book.similarity_score * 100)}% Match</div>` 
        : '';

    bookCard.innerHTML = `
        <div class="book-cover-wrapper">
            <img src="${imageUrl}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';">
        </div>
        <div class="book-info">
            <h3>${title}</h3>
            <p>by ${author}</p>
            <div class="book-meta-bottom">
                <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-secondary);">${book.ISBN}</span>
                ${rating || similarity || '<div class="book-rating-badge">— Rating</div>'}
            </div>
        </div>
    `;

    return bookCard;
}