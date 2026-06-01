from fastapi import APIRouter
from models.demo import DemoRequest, DemoResponse

router = APIRouter()


@router.get("/demo", response_model=DemoResponse)
def get_demo():
    # TODO: Replace with your concept's read/query logic
    return DemoResponse(message="Hello from the demo backend!")


@router.post("/demo", response_model=DemoResponse)
def post_demo(body: DemoRequest):
    # TODO: Implement the core logic for your concept here
    # body.input contains whatever the learner typed in the UI
    return DemoResponse(message=f"You sent: {body.input}")
