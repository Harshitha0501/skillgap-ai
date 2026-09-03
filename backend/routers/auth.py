from fastapi import APIRouter, Depends, HTTPException, Response

from lib.auth import (
    clear_session_cookie,
    current_user,
    hash_password,
    set_session_cookie,
    verify_password,
)
from lib.db import db
from lib.progress import recompute_user_analyses, record_progress
from models.schemas import LoginRequest, ProfileUpdate, SignupRequest, UserOut
from models.schemas import _now, _uid

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_out(user: dict) -> UserOut:
    return UserOut(
        id=user["id"],
        name=user.get("name", ""),
        email=user.get("email", ""),
        skills=user.get("skills", []),
        experience_years=user.get("experience_years", 0),
        resume_text=user.get("resume_text", ""),
    )


@router.post("/signup", response_model=UserOut)
async def signup(payload: SignupRequest, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {
        "id": _uid(),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "skills": [],
        "experience_years": 0,
        "resume_text": "",
        "created_at": _now(),
    }
    await db.users.insert_one(dict(user))
    set_session_cookie(response, user["id"])
    return _to_out(user)


@router.post("/login", response_model=UserOut)
async def login(payload: LoginRequest, response: Response):
    user = await db.users.find_one({"email": payload.email.lower().strip()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    set_session_cookie(response, user["id"])
    return _to_out(user)


@router.post("/logout")
async def logout(response: Response):
    clear_session_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(current_user)):
    return _to_out(user)


@router.put("/me", response_model=UserOut)
async def update_me(payload: ProfileUpdate, user: dict = Depends(current_user)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    fresh = await db.users.find_one({"id": user["id"]})
    if fresh and ("skills" in updates or "experience_years" in updates):
        # The profile drives every score, so keep saved analyses and the timeline in step.
        await recompute_user_analyses(fresh)
        await record_progress(fresh, "profile_updated")
    return _to_out(fresh or user)
