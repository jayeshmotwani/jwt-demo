from pydantic import BaseModel


class DemoRequest(BaseModel):
    # TODO: Add fields that match what your demo's UI sends
    input: str


class DemoResponse(BaseModel):
    # TODO: Add fields that match what your demo's UI expects back
    message: str
