from datetime import datetime, timezone, timedelta
from typing import Optional
import json

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import WeatherReading, FIELD_META
from mqtt_client import latest, register_ws_callback, unregister_ws_callback

router = APIRouter(prefix="/api", tags=["weather"])

NUMERIC_FIELDS = [
    "winddir_deg", "wind_kph", "rain_mm_h", "rain_total_mm",
    "humidity_rh", "temp_c", "pressure_pa",
    "battery_v", "light_v",
]


@router.get("/latest")
async def get_latest():
    """Último paquete completo de la estación."""
    return latest


@router.get("/history")
async def get_history(
    field: str = Query(default="temp_c"),
    hours: int = Query(default=24, ge=1, le=720),
    limit: int = Query(default=300, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Historial de un campo específico."""
    if field not in NUMERIC_FIELDS:
        return {"error": f"Campo inválido. Usa: {NUMERIC_FIELDS}"}

    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    col = getattr(WeatherReading, field)

    result = await db.execute(
        select(WeatherReading.timestamp, col)
        .where(WeatherReading.timestamp >= since, col.isnot(None))
        .order_by(desc(WeatherReading.timestamp))
        .limit(limit)
    )
    rows = result.all()

    data = [
        {"timestamp": r[0].isoformat(), "value": r[1]}
        for r in reversed(rows)
    ]
    # Si es presión, convertir a hPa
    if field == "pressure_pa":
        data = [{**d, "value": round(d["value"] / 100, 2)} for d in data]

    return data


@router.get("/stats")
async def get_stats(
    field: str = Query(default="temp_c"),
    hours: int = Query(default=24, ge=1, le=720),
    db: AsyncSession = Depends(get_db),
):
    """Min / Max / Avg de un campo."""
    if field not in NUMERIC_FIELDS:
        return {"error": "Campo inválido"}

    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    col = getattr(WeatherReading, field)

    result = await db.execute(
        select(
            func.min(col), func.max(col), func.avg(col), func.count(col)
        ).where(WeatherReading.timestamp >= since, col.isnot(None))
    )
    row = result.one()
    divisor = 100.0 if field == "pressure_pa" else 1.0
    decimals = FIELD_META.get(field, {}).get("decimals", 2)

    return {
        "field":  field,
        "min":    round(row[0] / divisor, decimals) if row[0] is not None else None,
        "max":    round(row[1] / divisor, decimals) if row[1] is not None else None,
        "avg":    round(row[2] / divisor, decimals) if row[2] is not None else None,
        "count":  row[3],
        "hours":  hours,
        "unit":   FIELD_META.get(field, {}).get("unit", ""),
    }


@router.get("/fields")
async def get_fields():
    """Metadatos de todos los campos disponibles."""
    return FIELD_META


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    async def send(data: str):
        try:
            await websocket.send_text(data)
        except Exception:
            pass

    register_ws_callback(send)
    # Enviar estado actual al conectarse
    await websocket.send_text(json.dumps({"type": "init", "data": latest}))

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        unregister_ws_callback(send)
