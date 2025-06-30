from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import pickle
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['bookRecommenderDB']
books_collection = db['books']

# Load data and model
print("Loading data and model...")
books = pd.read_csv('books.csv')
ratings = pd.read_csv('ratings.csv')

# Prepare recommendation system
ratings_with_name = ratings.merge(books, on='ISBN')
num_rating_df = ratings_with_name.groupby('Book-Title').count()['Book-Rating'].reset_index()
num_rating_df.rename(columns={'Book-Rating': 'num_ratings'}, inplace=True)
avg_rating_df = ratings_with_name.groupby('Book-Title', as_index=False)['Book-Rating'].mean()
avg_rating_df.rename(columns={'Book-Rating': 'avg_rating'}, inplace=True)

# Popular books for fallback recommendations
popular_df = num_rating_df.merge(avg_rating_df, on='Book-Title')
popular_df = popular_df[popular_df['num_ratings'] >= 250].sort_values('avg_rating', ascending=False).head(50)
popular_df = popular_df.merge(books, on='Book-Title').drop_duplicates('Book-Title')[
    ['Book-Title', 'Book-Author', 'Image-URL-M', 'num_ratings', 'avg_rating', 'ISBN']]

# Prepare the pivot table for recommendations
x = ratings_with_name.groupby('User-ID').count()['Book-Rating'] > 200
experienced_users = x[x].index
filtered_rating = ratings_with_name[ratings_with_name['User-ID'].isin(experienced_users)]

y = filtered_rating.groupby('Book-Title').count()['Book-Rating'] >= 10
famous_books = y[y].index
final_ratings = filtered_rating[filtered_rating['Book-Title'].isin(famous_books)]
pt = final_ratings.pivot_table(index='Book-Title', columns='User-ID', values='Book-Rating')
pt.fillna(0, inplace=True)

# Calculate similarity scores
print("Calculating similarity scores...")
similarity_scores = cosine_similarity(pt)
book_avg_rating = avg_rating_df.set_index('Book-Title')['avg_rating']
print("Model loaded successfully!")

@app.route('/search', methods=['GET'])
def search_books():
    query = request.args.get('query', '').lower()
    if not query:
        return jsonify([])
    
    # Search books by title
    results = books[books['Book-Title'].str.lower().str.contains(query, na=False)]
    results = results.head(10).to_dict('records')
    return jsonify(results)

@app.route('/book/<isbn>', methods=['GET'])
def get_book_details(isbn):
    # Get book details from MongoDB
    book = books_collection.find_one({'ISBN': isbn}, {'_id': 0})
    if not book:
        return jsonify({"error": "Book not found"}), 404
    return jsonify(book)

@app.route('/recommend', methods=['GET'])
def recommend_books():
    book_title = request.args.get('title', '')
    if not book_title:
        return jsonify({"error": "Book title is required"}), 400
    
    if book_title not in pt.index:
        # Return popular books as fallback
        popular_books = popular_df.head(5).to_dict('records')
        return jsonify({
            "message": "Book not found in dataset. Showing popular recommendations instead.",
            "recommendations": popular_books
        })
    
    try:
        # Get index of the book
        index = np.where(pt.index == book_title)[0][0]
        
        # Get similar items
        similar_items = list(enumerate(similarity_scores[index]))
        similar_items = sorted(similar_items, key=lambda x: x[1], reverse=True)[1:6]
        
        recommendations = []
        for i in similar_items:
            book_title = pt.index[i[0]]
            avg_rating = book_avg_rating.get(book_title, 0)
            
            # Get full book details
            book_details = books[books['Book-Title'] == book_title].iloc[0].to_dict()
            book_details['avg_rating'] = float(avg_rating)
            book_details['similarity_score'] = float(i[1])
            recommendations.append(book_details)
        
        return jsonify({
            "message": "Recommendations found",
            "recommendations": recommendations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)