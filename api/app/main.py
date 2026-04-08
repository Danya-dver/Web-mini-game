import os
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


APP_NAME = os.getenv("APP_NAME", "web-mini-game-stand")
APP_ENV = os.getenv("APP_ENV", "dev")

DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "minigame")
DB_USER = os.getenv("DB_USER", "minigame_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "minigame_pass")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")
    if origin.strip()
]

app = FastAPI(title=APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScoreCreate(BaseModel):
    player_name: str = Field(..., min_length=1, max_length=64)
    score: int = Field(..., ge=0, le=999999)


def get_conn():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=RealDictCursor,
    )


@app.get("/")
def root():
    return {
        "service": APP_NAME,
        "env": APP_ENV,
        "status": "ok",
    }


@app.get("/health/live")
def health_live():
    return {
        "status": "ok",
        "service": "api",
        "check": "liveness",
    }


@app.get("/health/ready")
def health_ready():
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 AS ok;")
                row = cur.fetchone()
        return {
            "status": "ok",
            "service": "api",
            "check": "readiness",
            "database": "ok" if row and row["ok"] == 1 else "fail",
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "fail",
                "service": "api",
                "check": "readiness",
                "database": "fail",
                "error": str(e),
            },
        )


@app.get("/health/full")
def health_full():
    db_status = "ok"
    error: Optional[str] = None
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) AS total FROM scores;")
                row = cur.fetchone()
                total_scores = row["total"]
    except Exception as e:
        db_status = "fail"
        total_scores = None
        error = str(e)

    status = "ok" if db_status == "ok" else "fail"

    payload = {
        "status": status,
        "service": "api",
        "env": APP_ENV,
        "checks": {
            "api": "ok",
            "database": db_status,
        },
        "stats": {
            "scores_total": total_scores,
        },
    }

    if error:
        payload["error"] = error

    if status != "ok":
        raise HTTPException(status_code=503, detail=payload)

    return payload


@app.post("/scores")
def create_score(score: ScoreCreate):
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO scores (player_name, score)
                    VALUES (%s, %s)
                    RETURNING id, player_name, score, created_at;
                    """,
                    (score.player_name.strip(), score.score),
                )
                created = cur.fetchone()
                conn.commit()
        return {"status": "ok", "data": created}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scores")
def list_scores(limit: int = 10):
    if limit < 1 or limit > 100:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 100")

    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, player_name, score, created_at
                    FROM scores
                    ORDER BY score DESC, created_at ASC
                    LIMIT %s;
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
        return {"status": "ok", "data": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
