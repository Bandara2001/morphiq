from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_admin
from app.supabase_client import get_supabase_client


router = APIRouter()


# --------------------------------------------------
# REQUEST SCHEMAS
# --------------------------------------------------

class ComponentCreate(BaseModel):
    component_key: str = Field(min_length=1, max_length=150)
    mesh_name: str | None = None
    display_name: str = Field(min_length=1, max_length=200)
    description: str | None = None
    scientific_name: str | None = None
    sort_order: int = 0
    is_selectable: bool = True


class ComponentUpdate(BaseModel):
    component_key: str | None = Field(default=None, min_length=1, max_length=150)
    mesh_name: str | None = None
    display_name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    scientific_name: str | None = None
    sort_order: int | None = None
    is_selectable: bool | None = None


# --------------------------------------------------
# PUBLIC ENDPOINT
# --------------------------------------------------

@router.get("/model/{model_id}")
async def get_model_components(model_id: UUID):
    """
    Retrieve components belonging to an approved model.
    """

    try:
        supabase = get_supabase_client()

        # Confirm that the model is approved.
        model_response = (
            supabase
            .table("biology_models")
            .select("id")
            .eq("id", str(model_id))
            .eq("status", "approved")
            .maybe_single()
            .execute()
        )

        if not model_response.data:
            raise HTTPException(
                status_code=404,
                detail="Approved biology model not found."
            )

        response = (
            supabase
            .table("model_components")
            .select(
                "id, model_id, component_key, mesh_name, "
                "display_name, description, scientific_name, "
                "sort_order, is_selectable"
            )
            .eq("model_id", str(model_id))
            .order("sort_order")
            .execute()
        )

        return {
            "success": True,
            "count": len(response.data),
            "components": response.data,
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Component retrieval error: {error}")

        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve model components."
        ) from error


# --------------------------------------------------
# ADMIN ENDPOINTS
# --------------------------------------------------

@router.post("/model/{model_id}", status_code=201)
async def create_model_component(
    model_id: UUID,
    component: ComponentCreate,
    admin: dict[str, Any] = Depends(get_current_admin),
):
    """Add a component to a model. Administrator only."""

    try:
        supabase = admin["supabase"]

        # Confirm that the model exists.
        model_response = (
            supabase
            .table("biology_models")
            .select("id")
            .eq("id", str(model_id))
            .maybe_single()
            .execute()
        )

        if not model_response.data:
            raise HTTPException(
                status_code=404,
                detail="Biology model not found."
            )

        component_data = component.model_dump()

        component_data["model_id"] = str(model_id)

        response = (
            supabase
            .table("model_components")
            .insert(component_data)
            .execute()
        )

        return {
            "success": True,
            "message": "Model component created.",
            "component": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Component creation error: {error}")

        raise HTTPException(
            status_code=400,
            detail="Unable to create model component. Check for duplicate component keys."
        ) from error


@router.patch("/{component_id}")
async def update_model_component(
    component_id: UUID,
    component: ComponentUpdate,
    admin: dict[str, Any] = Depends(get_current_admin),
):
    """Update a model component. Administrator only."""

    try:
        supabase = admin["supabase"]

        update_data = component.model_dump(
            exclude_unset=True
        )

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No fields were provided for updating."
            )

        response = (
            supabase
            .table("model_components")
            .update(update_data)
            .eq("id", str(component_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Model component not found."
            )

        return {
            "success": True,
            "message": "Model component updated.",
            "component": response.data[0],
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Component update error: {error}")

        raise HTTPException(
            status_code=400,
            detail="Unable to update model component."
        ) from error


@router.delete("/{component_id}")
async def delete_model_component(
    component_id: UUID,
    admin: dict[str, Any] = Depends(get_current_admin),
):
    """Delete a model component. Administrator only."""

    try:
        supabase = admin["supabase"]

        response = (
            supabase
            .table("model_components")
            .delete()
            .eq("id", str(component_id))
            .select("id")
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Model component not found."
            )

        return {
            "success": True,
            "message": "Model component deleted.",
        }

    except HTTPException:
        raise

    except Exception as error:
        print(f"Component deletion error: {error}")

        raise HTTPException(
            status_code=400,
            detail="Unable to delete model component."
        ) from error