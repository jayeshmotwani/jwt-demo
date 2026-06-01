from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from models.demo import LoginRequest, LoginResponse, VerifyRequest, VerifyResponse

router = APIRouter()
security = HTTPBearer()

DEMO_USER = {"username": "demo", "password": "secret"}


def create_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    if body.username != DEMO_USER["username"] or body.password != DEMO_USER["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(body.username)
    return LoginResponse(token=token)


@router.get("/protected")
def protected(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).isoformat()
    return {
        "message": f"Hello, {payload['sub']}!",
        "user": payload["sub"],
        "expires_at": expires_at,
    }


@router.post("/verify", response_model=VerifyResponse)
def verify(body: VerifyRequest):
    try:
        payload = jwt.decode(body.token, SECRET_KEY, algorithms=[ALGORITHM])
        return VerifyResponse(valid=True, payload=payload)
    except jwt.InvalidSignatureError:
        return VerifyResponse(
            valid=False,
            error_type="SignatureVerificationError",
            error_message="The signature didn't match — someone tampered with the payload.",
        )
    except jwt.ExpiredSignatureError:
        return VerifyResponse(
            valid=False,
            error_type="TokenExpiredError",
            error_message="This token has expired. Sign in again to get a fresh one.",
        )
    except jwt.DecodeError:
        return VerifyResponse(
            valid=False,
            error_type="MalformedToken",
            error_message="This doesn't look like a valid JWT — it should have three base64 parts separated by dots.",
        )
    except Exception:
        return VerifyResponse(
            valid=False,
            error_type="InvalidToken",
            error_message="This token is invalid.",
        )
