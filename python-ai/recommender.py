try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    model = SentenceTransformer("all-MiniLM-L6-v2")
    _model_loaded = True
except ImportError:
    _model_loaded = False


def score_opportunity_match(user_profile: dict, opportunity: dict) -> float:
    """
    Score how well an opportunity matches a user.
    Uses cosine similarity between skill/interest embeddings.
    Returns 0-100 percentage.
    """
    if not _model_loaded:
        # Fallback: simple keyword overlap
        user_terms = set(user_profile.get("skills", []) + user_profile.get("interests", []))
        opp_terms = set(opportunity.get("skills_required", []))
        if not user_terms or not opp_terms:
            return 50.0
        overlap = len(user_terms & opp_terms)
        return round(min(100, 50 + overlap * 15), 1)

    user_text = (
        f"{' '.join(user_profile.get('skills', []))} "
        f"{' '.join(user_profile.get('interests', []))} "
        f"{user_profile.get('bio', '')}"
    )
    opp_text = (
        f"{opportunity.get('title', '')} "
        f"{opportunity.get('description', '')} "
        f"{' '.join(opportunity.get('skills_required', []))}"
    )

    user_embedding = model.encode([user_text])
    opp_embedding = model.encode([opp_text])
    similarity = cosine_similarity(user_embedding, opp_embedding)[0][0]
    return round(float(similarity) * 100, 1)
