from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app import health, categories
from app import health, categories, models, components
from app import health, categories, models, components, uploads

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for the Morphiq Biology Learning Platform"
)


# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register feature endpoints
app.include_router(
    health.router,
    prefix="/api/v1",
    tags=["Health"]
)

app.include_router(
    categories.router,
    prefix="/api/v1/categories",
    tags=["Biology Categories"]
)

app.include_router(
    models.router,
    prefix="/api/v1/models",
    tags=["3D Models"]
)

app.include_router(
    components.router,
    prefix="/api/v1/components",
    tags=["Model Components"]
)

app.include_router(
    uploads.router,
    prefix="/api/v1/uploads",
    tags=["File Uploads"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Morphiq API",
        "version": settings.APP_VERSION
    }