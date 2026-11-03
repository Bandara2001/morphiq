from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache
def get_supabase_client() -> Client:
    """
    Create and reuse a Supabase client using the publishable key.

    This client respects Supabase Row Level Security (RLS).
    """

    if not settings.SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is not configured.")

    if not settings.SUPABASE_PUBLISHABLE_KEY:
        raise RuntimeError("SUPABASE_PUBLISHABLE_KEY is not configured.")

    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_PUBLISHABLE_KEY
    )


@lru_cache
def get_supabase_admin_client() -> Client:
    """
    Create and reuse a trusted server-side Supabase client.

    The secret key bypasses RLS. Only use this client after
    implementing appropriate backend authentication and authorization.
    """

    if not settings.SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is not configured.")

    if not settings.SUPABASE_SECRET_KEY:
        raise RuntimeError("SUPABASE_SECRET_KEY is not configured.")

    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SECRET_KEY
    )