from typing import Any
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.auth import get_current_admin, get_current_user
from app.supabase_client import get_supabase_client


router = APIRouter()


# --------------------------------------------------
# REQUEST SCHEMAS
# --------------------------------------------------

class ModelCreate(BaseModel):
    category_id: UUID
    title: str = Field(min_length=2, max_length=200)
    slug: str = Field(min_length=2, max_length=200)
    scientific_name: str | None = None
    description: str | None = None
    learning_objectives: list[str] = Field(default_factory=list)


class ModelUpdate(BaseModel):
    category_id: UUID | None = None
    title: str | None = Field(default=None, min_length=2, max_length=200)
    slug: str | None = Field(default=None, min_length=2, max_length=200)
    scientific_name: str | None = None
    description: str | None = None
    learning_objectives: list[str] | None = None
    model_storage_path: str | None = None
    thumbnail_storage_path: str | None = None


class ModelReview(BaseModel):
    status: str = Field(pattern="^(approved|rejected|review)$")


# --------------------------------------------------
# PUBLIC ENDPOINTS
# --------------------------------------------------

@router.get("/")
async def get_approved_models(
    category_id: UUID | None = Query(default=None),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Retrieve approved 3D models.

    Optional filters:
    - category_id
    - search
    - limit
    - offset
    """

    try:
        supabase = get_supabase_client()

        query = (
            supabase
            .table("biology_models")
            .select(
                "id, category_id, title, slug, scientific_name, "
                "description, learning_objectives, "
                "model_storage_path, thumbnail_storage_path, created_at"
            )
            .eq("status", "approved")
        )

        if category_id:
            query = query.eq("category_id", str(category_id))

        if search:
            query = query.ilike("title", f"%{search}%")

        response = (
            query
            .order("title")
            .range(offset, offset + limit - 1)
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "models": response.data,
            "limit": limit,
            "offset": offset,
        }

    except Exception as error:
        print(f"Model retrieval error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve biology models."
        ) from error


@router.get("/{model_id}")
async def get_model(model_id: UUID):
    """Retrieve one approved 3D model."""

    try:
        supabase = get_supabase_client()

        response = (
            supabase
            .table("biology_models")
            .select("*")
            .eq("id", str(model_id))
            .eq("status", "approved")
            .maybe_single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Approved model not found."
            )

        return {
            "success": True,
            "model": response.data,
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Model detail error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve the biology model."
        ) from error


# --------------------------------------------------
# ADMIN ENDPOINTS
# --------------------------------------------------

@router.post("/", status_code=201)
async def create_model(
    model: ModelCreate,
    admin: dict[str, Any] = Depends(get_current_admin),
):
    """Create a draft 3D model. Administrator only."""

    try:
        supabase = admin["supabase"]

        model_data = model.model_dump(mode="json")

        model_data["created_by"] = admin["id"]
        model_data["status"] = "draft"

        response = (
            supabase
            .table("biology_models")
            .insert(model_data)
            .execute()
        )

        return {
            "success": True,
            "message": "Draft biology model created.",
            "model": response.data[0],
        }

    except Exception as error:
        print(f"Model creation error: {error}")

        raise HTTPException(
            status_code=400,
            detail="Unable to create the biology model. Check the category and slug."
        ) from error


@router.patch("/{model_id}")
async def update_model(
    model_id: UUID,
    model: ModelUpdate,
    admin: dict[str, Any] = Depends(get_current_admin),
):
    """Update model information. Administrator only."""

    try:
        supabase = admin["supabase"]

        update_data = model.model_dump(
            exclude_unset=True,
            mode="json"
        )

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields were provided for updating."
            )

        response = (
            supabase
            .table("biology_models")
            .update(update_data)
            .eq("id", str(model_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Biology model not found."
            )

        return {
            "success": True,
            "message": "Biology model updated.",
            "model": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Model update error: {error}")

        raise HTTPException(
            status_code=400,
            detail="Unable to update the biology model."
        ) from error


@router.patch("/{model_id}/review")
async def review_model(
    model_id: UUID,
    review: ModelReview,
    admin: dict[str, Any] = Depends(get_current_admin),
):
    """Approve, reject or return a model for review."""

    try:
        supabase = admin["supabase"]

        update_data = {
            "status": review.status,
            "reviewed_by": admin["id"],
        }

        # Set review time when the model is approved or rejected.
        # Returning a model to review clears the review timestamp.
        if review.status == "review":
            update_data["reviewed_at"] = None
            update_data["reviewed_by"] = None
        else:
            update_data["reviewed_at"] =datetime.now(
                timezone.utc
            ).isoformat()

        response = (
            supabase
            .table("biology_models")
            .update(update_data)
            .eq("id", str(model_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Biology model not found."
            )

        return {
            "success": True,
            "message": f"Model status changed to {review.status}.",
            "model": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Model review error: {error}")

        raise HTTPException(
            status_code=400,
            detail="Unable to update the model review status."
        ) from error