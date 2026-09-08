from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Lons Cartographie API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"service": "Lons-le-Saunier Cartographie", "status": "ok"}


@api_router.get("/config")
async def get_config():
    return {
        "city": "Lons-le-Saunier",
        "insee": "39300",
        "boundary_id": "152508",
        "center": {"lat": 46.6739, "lon": 5.5539},
        "themes": ["mobility", "commerces"],
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
