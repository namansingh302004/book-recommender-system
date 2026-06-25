# Book Recommender System

A full-stack book recommendation web application that uses collaborative filtering to help users discover similar books. The project combines a Flask API, MongoDB-backed book metadata, and a lightweight HTML/CSS/JavaScript frontend.

---

## Features

- Search books by title through a Flask API.
- View detailed book metadata by ISBN.
- Generate similar-book recommendations using cosine similarity.
- Fall back to popular books when a searched title is not available in the recommendation matrix.
- Serve a simple browser-based interface with vanilla JavaScript.
- Store and retrieve book records from MongoDB.

---

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Python, Flask, Flask-CORS |
| Data/ML | pandas, NumPy, scikit-learn |
| Database | MongoDB, PyMongo |

---

## Folder Structure

```text
book-recommender-system/
├── backend/
│   ├── app.py
│   └── mongoDB_script.py
├── frontend/
│   ├── book.html
│   ├── book.js
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── .gitignore
├── README.md
└── requirements.txt
```

---

## Prerequisites

- Python 3.10+
- MongoDB running locally or available through a MongoDB connection string
- Book recommendation datasets:
  - `books.csv`
  - `ratings.csv`

The current code expects the dataset files to be available when the Flask app starts. These dataset files are intentionally not committed because they can be large and environment-specific.

---

## Installation

Clone the repository and install the Python dependencies:

```bash
git clone https://github.com/namansingh302004/book-recommender-system.git
cd book-recommender-system
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Place the required dataset files where the backend can read them:

```text
books.csv
ratings.csv
```

Start MongoDB locally, or update the MongoDB connection in `backend/app.py` for your environment.

---

## Usage

Run the Flask backend:

```bash
python backend/app.py
```

Open the frontend in a browser:

```text
frontend/index.html
```

By default, the frontend expects the API at:

```text
http://localhost:5000
```

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/search?query=<title>` | Searches books by title. |
| `GET` | `/book/<isbn>` | Returns book details from MongoDB. |
| `GET` | `/recommend?title=<book-title>` | Returns similar book recommendations. |

---

## Project Workflow

1. The Flask app loads book and rating datasets with pandas.
2. Ratings are merged with book metadata.
3. Frequently rated books and experienced users are filtered to build a recommendation matrix.
4. Cosine similarity is calculated between books.
5. The frontend searches the API, opens a selected book page, and requests recommendations for that title.

---

## Configuration

The current backend uses a local MongoDB connection:

```text
mongodb://localhost:27017/
```

Database name:

```text
bookRecommenderDB
```

Collection used by the book details endpoint:

```text
books
```

For production use, move configuration values to environment variables and avoid hardcoding database connection details.

---

## Screenshots

Screenshots are not included yet. Recommended screenshots:

- Search page with results.
- Book detail page.
- Recommendation results section.

---

## Future Improvements

- Move dataset paths and MongoDB connection settings into environment variables.
- Add a dedicated data import script for MongoDB.
- Add automated tests for API endpoints.
- Add frontend error states for unavailable backend or missing datasets.
- Package the frontend and backend with a reproducible local development workflow.
- Add deployment instructions for a cloud-hosted backend and database.

---

## License

No license file is currently included. Add a license before distributing or accepting contributions.

---

## Author

Naman Kumar Singh

---

## GitHub Repository Metadata

- Suggested repository name: `book-recommender-system`
- Suggested description: `A Flask and MongoDB web app for collaborative-filtering book recommendations.`
- Suggested topics: `python`, `flask`, `mongodb`, `recommendation-system`, `collaborative-filtering`, `machine-learning`, `javascript`
