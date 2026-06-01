import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_SECONDS, REFRESH_TOKEN_EXPIRE_DAYS
from models.demo import (
    LoginRequest, LoginResponse,
    VerifyRequest, VerifyResponse,
    RefreshRequest, RefreshResponse,
    LogoutResponse,
)

router = APIRouter()
security = HTTPBearer()

DEMO_USER = {"username": "demo", "password": "secret"}

# In production, use Redis or a DB-backed store so the denylist survives restarts.
token_denylist: set = set()


def create_access_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).timestamp()),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    if body.username != DEMO_USER["username"] or body.password != DEMO_USER["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return LoginResponse(
        access_token=create_access_token(body.username),
        refresh_token=create_refresh_token(body.username),
    )


@router.get("/protected")
def protected(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={"error_type": "TokenExpiredError", "message": "Token has expired"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    jti = payload.get("jti")
    if jti and jti in token_denylist:
        raise HTTPException(
            status_code=401,
            detail={
                "error_type": "RevokedToken",
                "message": "This token has been explicitly revoked.",
            },
        )

    expires_at = datetime.fromtimestamp(payload["exp"], tz=timezone.utc).isoformat()
    return {
        "message": f"Hello, {payload['sub']}!",
        "user": payload["sub"],
        "expires_at": expires_at,
    }


@router.post("/refresh", response_model=RefreshResponse)
def refresh(body: RefreshRequest):
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token has expired — please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")

    return RefreshResponse(access_token=create_access_token(payload["sub"]))


@router.post("/logout", response_model=LogoutResponse)
def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token already expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    jti = payload.get("jti")
    if jti:
        token_denylist.add(jti)

    return LogoutResponse(message="Token revoked")


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
