from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import auth

load_dotenv()

app = FastAPI(title="JWT Authentication — codecrumbs.in")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
