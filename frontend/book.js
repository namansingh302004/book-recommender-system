// Constants
const API_BASE_URL = 'http://localhost:5000';
const bookDetailsContainer = document.getElementById('book-details');
const recommendationsContainer = document.getElementById('recommendations-container');
const recommendationsSectionHeader = document.querySelector('#recommendations-section .section-title');

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

        // Fetch recommendations based on title
        try {
            const recommendResponse = await fetch(`${API_BASE_URL}/recommend?title=${encodeURIComponent(book['Book-Title'])}`);
            if (!recommendResponse.ok) throw new Error('Failed to load recommendations');

            const recommendData = await recommendResponse.json();
            displayRecommendations(recommendData);
        } catch (recError) {
            console.error('Error fetching recommendations:', recError);
            recommendationsContainer.innerHTML = `
                <div class="message-container message-error">
                    <span>✕</span>
                    <p>Failed to generate recommendations. Index server offline.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Error loading book details:', error);
        bookDetailsContainer.innerHTML = `
            <div class="message-container message-error">
                <span>✕</span>
                <p>Failed to load volume specifications. Verify database connections and retry.</p>
            </div>
        `;
        recommendationsContainer.innerHTML = '';
    }
}

function displayBookDetails(book) {
    // Update page title
    document.title = `${book['Book-Title']} | BookRecommender Spec`;

    const imageUrl = book['Image-URL-L'] || book['Image-URL-M'] || 'placeholder.jpg';
    const title = book['Book-Title'] || 'Untitled';
    const author = book['Book-Author'] || 'Unknown Author';
    const publisher = book['Publisher'] || 'Unknown Publisher';
    const year = book['Year-Of-Publication'] || 'N/A';

    bookDetailsContainer.innerHTML = `
        <div class="book-details-container">
            <div class="book-cover">
                <img src="${imageUrl}" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';">
            </div>
            <div class="book-details-info">
                <h2>${title}</h2>
                <h3>by ${author}</h3>
                
                <div class="tech-details-list">
                    <div class="tech-detail-row">
                        <span class="tech-detail-label">ISBN-10 SPECIFICATION</span>
                        <span class="tech-detail-value">${book.ISBN}</span>
                    </div>
                    <div class="tech-detail-row">
                        <span class="tech-detail-label">PUBLISHING SYSTEM</span>
                        <span class="tech-detail-value">${publisher}</span>
                    </div>
                    <div class="tech-detail-row">
                        <span class="tech-detail-label">RELEASE DATE</span>
                        <span class="tech-detail-value">${year}</span>
                    </div>
                </div>

                <div class="book-description">
                    <p>This volume is indexed in our high-performance recommender database. Scroll below to explore similar publications identified by our collaborative filtering systems.</p>
                </div>
            </div>
        </div>
    `;
}

function displayRecommendations(data) {
    const { message, recommendations } = data;

    // Update section title if fallback recommendations
    if (message && message.includes('not found')) {
        if (recommendationsSectionHeader) {
            recommendationsSectionHeader.innerHTML = 'Popular Recommendations';
        }
    } else {
        if (recommendationsSectionHeader) {
            recommendationsSectionHeader.innerHTML = 'Recommended Matches';
        }
    }

    recommendationsContainer.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
        recommendationsContainer.innerHTML = `
            <div class="message-container message-info">
                <span>ℹ</span>
                <p>No similar titles found in the matrix.</p>
            </div>
        `;
        return;
    }

    recommendations.forEach(book => {
        const bookCard = createBookCard(book);
        recommendationsContainer.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.addEventListener('click', () => {
        window.location.href = `book.html?isbn=${book.ISBN}`;
    });

    const imageUrl = book['Image-URL-M'] || book['Image-URL-L'] || 'placeholder.jpg';
    const title = book['Book-Title'] || 'Untitled';
    const author = book['Book-Author'] || 'Unknown Author';

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