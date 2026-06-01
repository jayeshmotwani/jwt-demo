from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import demo

load_dotenv()

app = FastAPI(title="codecrumbs demo")  # TODO: Replace with your concept name

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demo.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
