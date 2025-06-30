# import pandas as pd
# from pymongo import MongoClient

# # Connect to MongoDB
# client = MongoClient('mongodb://localhost:27017/')
# db = client['bookRecommenderDB']

# # Create collections
# books_collection = db['books']
# ratings_collection = db['ratings']
# users_collection = db['users']

# # Import books data
# print("Importing books data...")
# books_df = pd.read_csv('Books.csv')
# books_records = books_df.to_dict('records')
# books_collection.insert_many(books_records)
# print(f"Imported {len(books_records)} book records")

# # Import ratings data
# print("Importing ratings data...")
# ratings_df = pd.read_csv('Ratings.csv')
# # We'll batch insert ratings since there might be many
# batch_size = 10000
# for i in range(0, len(ratings_df), batch_size):
#     batch = ratings_df.iloc[i:i+batch_size].to_dict('records')
#     ratings_collection.insert_many(batch)
#     print(f"Imported ratings batch {i//batch_size + 1}")

# # Import users data
# print("Importing users data...")
# users_df = pd.read_csv('Users.csv')
# users_records = users_df.to_dict('records')
# users_collection.insert_many(users_records)
# print(f"Imported {len(users_records)} user records")

# print("Data import complete!")