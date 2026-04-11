import asyncio
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from mqtt_client import start_mqtt_client
from routers.sensors import router as sensors_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(
    title="Estación Meteorológica API",
    description="API REST + WebSocket para monitoreo de datos meteorológicos vía MQTT",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensors_router)


@app.on_event("startup")
async def startup_event():
    await init_db()
    loop = asyncio.get_event_loop()
    start_mqtt_client(loop)


@app.get("/")
async def root():
    return {
        "message": "🌤️ Estación Meteorológica API",
        "docs": "/docs",
        "ws": "/api/ws",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
