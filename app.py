from fastapi import FastAPI
import joblib
import pandas as pd


pipe = joblib.load("recommender_pipeline_decision_tree.joblib")


import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
import random

# Load your dataset
df = pd.read_csv("dummy_travel_dataset_500.csv")

# Encode categorical variables
df_encoded = pd.get_dummies(df, columns=["Region", "Sub-region", "Activity"])

# Features and target
X = df_encoded.drop(columns=["Destination"])
y = df["Destination"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train decision tree
clf = DecisionTreeClassifier(random_state=42)
clf.fit(X_train, y_train)

def recommend(region: str, sub_region: str, min_rating: float, max_expense: float, top_n: int = 5):
    """
    Recommend top_n destinations matching criteria.
    """
    # Filter dataset based on user constraints
    filtered = df[
        (df["Region"].str.lower() == region.lower()) &
        (df["Sub-region"].str.lower() == sub_region.lower()) &
        (df["Rating"] >= min_rating) &
        (df["Expense"] <= max_expense)
    ]
    
    if filtered.empty:
        return ["No matching destinations found."]
    
    # Randomly choose top_n from filtered results (or you can score with the model)
    return filtered["Destination"].sample(min(top_n, len(filtered))).tolist()

app = FastAPI()
@app.get("/")
def read_root():
    return {"message": "Welcome to my Recommendation System API!"}


@app.get("/recommend")
def get_recommend(
    region: str,
    sub_region: str,
    min_rating: float,
    max_expense: float,
    top_n: int = 5
):
    recs = recommend(region, sub_region, min_rating, max_expense, top_n)
    return {"recommendations": recs}

