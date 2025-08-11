import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

DATA_PATH = "dummy_travel_dataset_500.csv"
df = pd.read_csv(DATA_PATH)

#binary target
df["is_popular"] = (df["Rating"] >= 4.0).astype(int)

#feature selection
FEATURE_COLS = ["Destination", "Activity", "Region", "Sub-region", "Expense"]
cat_cols = ["Destination", "Activity", "Region", "Sub-region"]

X = df[FEATURE_COLS].copy()
y = df["is_popular"]

#Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.20, random_state=42)

#Preprocessor + simple Decision Tree (fast)
preprocessor = ColumnTransformer(
    transformers=[("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)],
    remainder="passthrough"
)

clf = DecisionTreeClassifier(max_depth=6, min_samples_leaf=3, random_state=42)
pipeline = Pipeline([("preprocessor", preprocessor), ("classifier", clf)])
pipeline.fit(X_train, y_train)

#evaluate quickly
y_pred = pipeline.predict(X_test)
print("Classification report:\n", classification_report(y_test, y_pred))
print("Confusion matrix:\n", confusion_matrix(y_test, y_pred))

#inspects top feature importances
ohe = pipeline.named_steps['preprocessor'].named_transformers_['cat']
ohe_features = list(ohe.get_feature_names_out(cat_cols))
feature_names = ohe_features + ["Expense"]
importances = pipeline.named_steps['classifier'].feature_importances_
feat_imp_df = pd.DataFrame({"feature": feature_names, "importance": importances}).sort_values("importance", ascending=False)
print("\nTop features:\n", feat_imp_df.head(12))

#Recommendation function
def recommend(pipeline_model, df_all, top_n=10, country=None, activities=None, max_budget=None, min_rating=None):
    df_filtered = df_all.copy()
    if country is not None:
        if isinstance(country, (list, tuple, set)):
            df_filtered = df_filtered[df_filtered["Region"].isin(country)]
        else:
            df_filtered = df_filtered[df_filtered["Region"] == country]
    if activities is not None:
        if isinstance(activities, (list, tuple, set)):
            df_filtered = df_filtered[df_filtered["Activity"].isin(activities)]
        else:
            df_filtered = df_filtered[df_filtered["Activity"] == activities]
    if max_budget is not None:
        df_filtered = df_filtered[df_filtered["Expense"] <= max_budget]
    if min_rating is not None:
        df_filtered = df_filtered[df_filtered["Rating"] >= min_rating]
    if df_filtered.empty:
        return df_filtered  # empty DataFrame: no matches

    X_cand = df_filtered[FEATURE_COLS]
    probs = pipeline_model.predict_proba(X_cand)[:, 1]
    df_filtered = df_filtered.assign(popularity_prob=probs)
    df_sorted = df_filtered.sort_values(by=["popularity_prob", "Rating", "Expense"], ascending=[False, False, True])
    cols = ["Destination", "Activity", "Region", "Sub-region", "Rating", "Expense", "popularity_prob"]
    return df_sorted[cols].head(top_n).reset_index(drop=True)

#Example
print("\nTop 5 recommendations for (Japan, Hiking, budget<=4000):")
print(recommend(pipeline, df, top_n=5, country="Japan", activities="Hiking", max_budget=4000))

#Save model for deployment
joblib.dump(pipeline, "recommender_pipeline_decision_tree.joblib")
print("Saved pipeline to recommender_pipeline_decision_tree.joblib")
