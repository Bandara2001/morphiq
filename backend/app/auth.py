from typing import Any

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client, create_client

from app.config import settings


security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> dict[str, Any]:

    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Authentication required."
        )

    token = credentials.credentials

    try:
        # Create a client for this request.
        # Do not share a mutable authenticated client between users.
        supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_PUBLISHABLE_KEY
        )

        # Verify the access token with Supabase Auth.
        auth_response = supabase.auth.get_user(token)
        user = auth_response.user

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired access token."
            )

        # Apply this user's JWT to PostgREST so RLS sees the
        # authenticated user rather than the anonymous role.
        supabase.postgrest.auth(token)
        

        # Retrieve the user's own profile.
        profile_response = (
            supabase
            .table("profiles")
            .select("id, account_type, teacher_status, is_admin")
            .eq("id", str(user.id))
            .single()
            .execute()
        )

        profile = profile_response.data

        return {
            "id": str(user.id),
            "email": user.email,
            "profile": profile,
            "is_admin": bool(profile.get("is_admin", False)),
            "supabase": supabase,
            "access_token": token,
        }

    except HTTPException:
        raise

    except Exception as error:
      import traceback

      print("\n========== AUTHENTICATION ERROR ==========")
      print("Error type:", type(error).__name__)
      print("Error details:", repr(error))
      traceback.print_exc()
      print("==========================================\n")

      raise HTTPException(
          status_code=401,
          detail=f"Authentication failed: {type(error).__name__}: {str(error)}"
      ) from error


async def get_current_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:

    if not current_user["is_admin"]:
        raise HTTPException(
            status_code=403,
            detail="Administrator permission required."
        )

    return current_user