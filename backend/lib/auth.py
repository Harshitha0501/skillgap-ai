"""Session auth: bcrypt password hashes + a JWT carried in an httpOnly cookie."""
import os
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, Request, Response
from passlib.context import CryptContext

from lib.db import db

COOKIE_NAME = "skillgap_session"
SECRET = os.environ.get("JWT_SECRET", "skillgap-dev-secret-change-me")
ALGO = "HS256"
TTL_DAYS = 14

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(raw: str) -> str:
    return _pwd.hash(raw[:72])


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return _pwd.verify(raw[:72], hashed)
    except ValueError:
        return False


def set_session_cookie(response: Response, user_id: str) -> None:
    token = jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=TTL_DAYS)},
        SECRET,
        algorithm=ALGO,
    )
    response.set_cookie(
        COOKIE_NAME,
        token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=TTL_DAYS * 86400,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME, path="/")


async def current_user(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session")
    user = await db.users.find_one({"id": payload.get("sub")})
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user
