from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentiment import analyze_text, analyze_text_detailed
from recommender import score_opportunity_match

app = FastAPI(title="HAVEN AI Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextInput(BaseModel):
    text: str


class MatchInput(BaseModel):
    user_profile: dict
    opportunity: dict


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/sentiment")
def sentiment_endpoint(body: TextInput):
    return analyze_text(body.text)


@app.post("/sentiment-detailed")
def sentiment_detailed_endpoint(body: TextInput):
    """Extended analysis for Guardian module (WhatsApp + Instagram)."""
    return analyze_text_detailed(body.text)


@app.post("/match-opportunity")
def match_endpoint(body: MatchInput):
    score = score_opportunity_match(body.user_profile, body.opportunity)
    return {"match_score": score}


# Run: uvicorn main:app --reload --port 8000
