from fastapi import APIRouter, HTTPException

from app.supabase_client import get_supabase_client


router = APIRouter()


@router.get("/")
async def get_categories():
    """
    Retrieve all active biology categories from Supabase.
    """

    try:
        supabase = get_supabase_client()

        response = (
            supabase
            .table("biology_categories")
            .select("id, name, slug, description, icon, sort_order")
            .eq("is_active", True)
            .order("sort_order")
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "categories": response.data
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        ) from error

    except Exception as error:
        print(f"Failed to retrieve biology categories: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve biology categories."
        ) from error