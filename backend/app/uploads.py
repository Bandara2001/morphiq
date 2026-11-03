
import uuid
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.auth import get_current_admin, get_current_user
from app.config import settings

router = APIRouter()

# Maximum upload sizes
MAX_MODEL_SIZE = 50 * 1024 * 1024
MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024
MAX_MATERIAL_SIZE = 20 * 1024 * 1024

MODEL_TYPES = {
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
}

IMAGE_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
}

MATERIAL_TYPES = {
    **IMAGE_TYPES,
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


async def read_upload(file: UploadFile, max_size: int) -> bytes:
    """Read an uploaded file while enforcing its maximum size."""

    content = await file.read(max_size + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > max_size:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds the maximum size of {max_size // (1024 * 1024)} MB.",
        )

    return content


def validate_file_signature(extension: str, content: bytes):
    """Validate the basic file signature."""

    valid = True

    if extension == ".glb":
        valid = content.startswith(b"glTF")

    elif extension == ".gltf":
        valid = content.lstrip().startswith(b"{")

    elif extension == ".png":
        valid = content.startswith(b"\x89PNG\r\n\x1a\n")

    elif extension in (".jpg", ".jpeg"):
        valid = content.startswith(b"\xff\xd8\xff")

    elif extension == ".webp":
        valid = (
            len(content) >= 12
            and content.startswith(b"RIFF")
            and content[8:12] == b"WEBP"
        )

    elif extension == ".pdf":
        valid = content.startswith(b"%PDF-")

    elif extension == ".doc":
        valid = content.startswith(bytes.fromhex("D0CF11E0A1B11AE1"))

    elif extension == ".docx":
        valid = content.startswith(b"PK")

    if not valid:
        raise HTTPException(
            status_code=400,
            detail="The file content does not match its extension.",
        )


def upload_to_supabase_storage(
    supabase,
    bucket: str,
    storage_path: str,
    content: bytes,
    content_type: str,
):
    """
    Upload using the Supabase Python SDK.

    The Supabase client must contain the authenticated user's JWT
    so that Storage RLS policies are respected.
    """

    return (
        supabase.storage
        .from_(bucket)
        .upload(
            path=storage_path,
            file=content,
            file_options={
                "content-type": content_type,
                "upsert": "false",
            },
        )
    )


async def upload_to_storage(
    bucket: str,
    storage_path: str,
    content: bytes,
    content_type: str,
    supabase,
):
    """Upload a file using the Supabase Storage SDK."""

    import asyncio

    try:
        loop = asyncio.get_running_loop()

        await loop.run_in_executor(
            None,
            upload_to_supabase_storage,
            supabase,
            bucket,
            storage_path,
            content,
            content_type,
        )

    except Exception as error:
        print("\n========== SUPABASE STORAGE ERROR ==========")
        print("Bucket:", bucket)
        print("Storage path:", storage_path)
        print("File size:", len(content), "bytes")
        print("Error type:", type(error).__name__)
        print("Error details:", repr(error))
        print("============================================\n")

        raise HTTPException(
            status_code=502,
            detail=f"Supabase Storage upload failed: {type(error).__name__}: {str(error)}",
        ) from error


@router.post("/models/{model_id}/3d", status_code=201)
async def upload_3d_model(
    model_id: str,
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
):
    """Upload a GLB or GLTF file for an existing biology model."""

    extension = Path(file.filename or "").suffix.lower()

    if extension not in MODEL_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only GLB and GLTF files are supported.",
        )

    content_type = MODEL_TYPES[extension]

    content = await read_upload(file, MAX_MODEL_SIZE)
    validate_file_signature(extension, content)

    supabase = admin["supabase"]

    # Confirm that the model exists.
    model_response = (
        supabase.table("biology_models")
        .select("id, status")
        .eq("id", model_id)
        .limit(1)
        .execute()
    )

    if not model_response.data:
        raise HTTPException(
            status_code=404,
            detail="Biology model not found.",
        )

    storage_path = f"models/{model_id}/{uuid.uuid4()}{extension}"

    # Upload the model.
    await upload_to_storage(
        bucket="biology-models",
        storage_path=storage_path,
        content=content,
        content_type=content_type,
        supabase=supabase,
    )

    # Save the uploaded file path in the database.
    try:
        update_response = (
            supabase.table("biology_models")
            .update({"model_storage_path": storage_path})
            .eq("id", model_id)
            .execute()
        )

        if not update_response.data:
            raise HTTPException(
                status_code=500,
                detail="File uploaded, but the model database record could not be updated.",
            )

    except Exception as error:
        print("Model database update error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="File uploaded, but the model database record could not be updated.",
        ) from error

    return {
        "success": True,
        "message": "3D model uploaded successfully.",
        "model_id": model_id,
        "storage_path": storage_path,
        "file_size": len(content),
    }


@router.post("/models/{model_id}/thumbnail", status_code=201)
async def upload_model_thumbnail(
    model_id: str,
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin),
):
    """Upload a thumbnail for an existing biology model."""

    extension = Path(file.filename or "").suffix.lower()

    if extension not in IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, JPEG and WEBP images are supported.",
        )

    content = await read_upload(file, MAX_THUMBNAIL_SIZE)
    validate_file_signature(extension, content)

    supabase = admin["supabase"]

    model_response = (
        supabase.table("biology_models")
        .select("id")
        .eq("id", model_id)
        .limit(1)
        .execute()
    )

    if not model_response.data:
        raise HTTPException(
            status_code=404,
            detail="Biology model not found.",
        )

    storage_path = f"thumbnails/{model_id}/{uuid.uuid4()}{extension}"

    await upload_to_storage(
        bucket="biology-thumbnails",
        storage_path=storage_path,
        content=content,
        content_type=IMAGE_TYPES[extension],
        supabase=supabase,
    )

    try:
        update_response = (
            supabase.table("biology_models")
            .update({"thumbnail_storage_path": storage_path})
            .eq("id", model_id)
            .execute()
        )

        if not update_response.data:
            raise HTTPException(
                status_code=500,
                detail="Thumbnail uploaded, but the model database record could not be updated.",
            )

    except Exception as error:
        print("Thumbnail database update error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Thumbnail uploaded, but the model database record could not be updated.",
        ) from error

    return {
        "success": True,
        "message": "Thumbnail uploaded successfully.",
        "model_id": model_id,
        "storage_path": storage_path,
        "file_size": len(content),
    }


@router.post("/learning-materials", status_code=201)
async def upload_learning_material(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    """Upload a private learning material for AI processing."""

    original_filename = Path(file.filename or "").name
    extension = Path(original_filename).suffix.lower()

    if extension not in MATERIAL_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload PDF, DOC, DOCX, PNG, JPG, JPEG or WEBP.",
        )

    content = await read_upload(file, MAX_MATERIAL_SIZE)
    validate_file_signature(extension, content)

    storage_path = f"{user['id']}/{uuid.uuid4()}{extension}"

    await upload_to_storage(
        bucket="learning-materials",
        storage_path=storage_path,
        content=content,
        content_type=MATERIAL_TYPES[extension],
        supabase=user["supabase"],
    )

    # Create a processing job for the uploaded material.
    try:
        response = (
            user["supabase"]
            .table("model_processing_jobs")
            .insert({
                "user_id": user["id"],
                "original_file_name": original_filename,
                "file_storage_path": storage_path,
                "file_type": extension.lstrip("."),
                "status": "queued",
            })
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=500,
                detail="File uploaded, but the processing job could not be created.",
            )

    except Exception as error:
        print("Processing job database error:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="File uploaded, but the processing job could not be created.",
        ) from error

    return {
        "success": True,
        "message": "Learning material uploaded successfully.",
        "job": response.data[0],
    }
