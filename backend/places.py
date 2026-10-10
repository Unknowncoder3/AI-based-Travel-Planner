"""Free, keyless place discovery, road-route and forecast helpers for Roamly.

Providers: OpenStreetMap/Nominatim, Overpass, OSRM and Open-Meteo. Results are
best-effort; respect provider usage policies and never treat forecasts as official
disaster clearance.
"""
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from urllib.parse import quote
import requests
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()
HEADERS = {"User-Agent": "RoamlyTravelPlanner/1.0 (open-source student project)"}
NOMINATIM = "https://nominatim.openstreetmap.org/search"
OVERPASS = "https://overpass-api.de/api/interpreter"


@lru_cache(maxsize=256)
def geocode(place: str):
    response = requests.get(
        NOMINATIM,
        params={"q": place, "format": "jsonv2", "limit": 1},
        headers=HEADERS,
        timeout=8,
    )
    response.raise_for_status()
    items = response.json()
    if not items:
        return None
    item = items[0]
    return {
        "name": item.get("display_name", place),
        "lat": float(item["lat"]),
        "lon": float(item["lon"]),
    }


def category_for(tags):
    if tags.get("historic") or tags.get("museum") or tags.get("heritage"):
        return "History & culture"
    if tags.get("amenity") in {"cafe", "restaurant", "tea"} or tags.get("shop") == "tea":
        return "Cafe & food"
    if tags.get("tourism") in {"viewpoint", "attraction", "museum", "gallery"}:
        return "Viewpoint & attraction"
    if tags.get("natural") or tags.get("leisure") in {"park", "garden"}:
        return "Nature & outdoors"
    return "Local discovery"


@router.get("/discover")
def discover(destination: str = Query(min_length=2, max_length=120)):
    """Return mapped nearby OSM places with coordinates, tags and optional image."""
    try:
        center = geocode(destination)
        if not center:
            raise HTTPException(status_code=404, detail=f"Couldn't locate {destination}. Try adding the state or country.")
        lat, lon = center["lat"], center["lon"]
        query = f"""
        [out:json][timeout:18];
        (
          node(around:12000,{lat},{lon})[tourism~"^(attraction|viewpoint|museum|gallery|artwork|zoo)$"];
          way(around:12000,{lat},{lon})[tourism~"^(attraction|viewpoint|museum|gallery|artwork|zoo)$"];
          relation(around:12000,{lat},{lon})[tourism~"^(attraction|viewpoint|museum|gallery|artwork|zoo)$"];
          node(around:12000,{lat},{lon})[historic];
          way(around:12000,{lat},{lon})[historic];
          node(around:12000,{lat},{lon})[amenity~"^(cafe|restaurant)$"];
          node(around:12000,{lat},{lon})[leisure~"^(park|garden)$"];
        );
        out center tags;
        """
        response = requests.post(OVERPASS, data={"data": query}, headers=HEADERS, timeout=24)
        response.raise_for_status()
        elements = response.json().get("elements", [])
        places = []
        seen = set()
        for element in elements:
            tags = element.get("tags", {})
            name = tags.get("name") or tags.get("name:en")
            if not name or name.casefold() in seen:
                continue
            coords = element.get("center", element)
            if "lat" not in coords or "lon" not in coords:
                continue
            seen.add(name.casefold())
            image = tags.get("image") or tags.get("wikimedia_commons")
            if image and image.startswith("File:"):
                image = "https://commons.wikimedia.org/wiki/Special:FilePath/" + quote(image[5:]) + "?width=800"
            places.append({
                "id": f'{element.get("type")}:{element.get("id")}',
                "name": name,
                "lat": float(coords["lat"]),
                "lon": float(coords["lon"]),
                "category": category_for(tags),
                "description": tags.get("description") or tags.get("tourism") or tags.get("historic") or "Local point of interest",
                "image": image if image and image.startswith("http") else None,
                "address": ", ".join(filter(None, [tags.get("addr:street"), tags.get("addr:city")])),
                "opening_hours": tags.get("opening_hours"),
                "website": tags.get("website") or tags.get("contact:website"),
                "wikidata": tags.get("wikidata"),
                "source": "OpenStreetMap",
            })
        places.sort(key=lambda p: ({"History & culture": 0, "Viewpoint & attraction": 1, "Nature & outdoors": 2, "Cafe & food": 3}.get(p["category"], 4), p["name"].casefold()))
        return {"destination": destination, "center": center, "places": places[:50], "source": "OpenStreetMap", "note": "Listings and opening hours can be incomplete. Confirm directly before visiting."}
    except HTTPException:
        raise
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="The free place-data service is temporarily unavailable. Please retry shortly.") from exc


@router.get("/journey")
def journey(origin: str = Query(min_length=2, max_length=120), destination: str = Query(min_length=2, max_length=120)):
    """Return a road route and intermediate towns when OSRM has a routable match."""
    try:
        start, end = geocode(origin), geocode(destination)
        if not start or not end:
            raise HTTPException(status_code=404, detail="Couldn't locate the start or destination. Add a state/country for better results.")
        url = f'https://router.project-osrm.org/route/v1/driving/{start["lon"]},{start["lat"]};{end["lon"]},{end["lat"]}'
        response = requests.get(url, params={"overview": "full", "geometries": "geojson", "steps": "false", "alternatives": "false"}, headers=HEADERS, timeout=18)
        response.raise_for_status()
        data = response.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            return {"origin": start, "destination": end, "route": [], "distance_km": None, "duration_hours": None, "note": "A routable road route was not available from the routing service."}
        route = data["routes"][0]
        coordinates = route["geometry"]["coordinates"]
        # Thin long geometries for the browser while preserving the overall road shape.
        stride = max(1, len(coordinates) // 500)
        line = [[float(lat), float(lon)] for lon, lat in coordinates[::stride]]
        if coordinates and line[-1] != [coordinates[-1][1], coordinates[-1][0]]:
            line.append([coordinates[-1][1], coordinates[-1][0]])
        # Label two actual points on the road route as intermediate places/towns.
        # Reverse geocoding is cached by location in Nominatim's service; keep this to two calls.
        intermediate_stops = []
        for fraction in (0.33, 0.66):
            if len(coordinates) < 3:
                continue
            idx = min(len(coordinates) - 1, int((len(coordinates) - 1) * fraction))
            lon, lat = coordinates[idx]
            try:
                reverse = requests.get(
                    "https://nominatim.openstreetmap.org/reverse",
                    params={"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 10},
                    headers=HEADERS, timeout=4,
                )
                reverse.raise_for_status()
                label = reverse.json()
                address = label.get("address", {})
                town = next((address.get(k) for k in ("town", "city", "village", "municipality", "county", "state_district") if address.get(k)), None)
                if town and all(stop["name"].casefold() != town.casefold() for stop in intermediate_stops):
                    intermediate_stops.append({"name": town, "lat": float(lat), "lon": float(lon), "category": "Along your route", "description": "Nearby town/area on the road route; confirm whether it suits your stopover."})
            except requests.RequestException:
                continue
        return {
            "origin": start, "destination": end, "route": line, "intermediate_stops": intermediate_stops,
            "distance_km": round(route["distance"] / 1000, 1),
            "duration_hours": round(route["duration"] / 3600, 1),
            "note": "Road-route estimate only; live traffic, closures, transit options and mountain-road conditions are not included.",
        }
    except HTTPException:
        raise
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="The free road-routing service is temporarily unavailable. Please retry shortly.") from exc


@router.get("/conditions")
def conditions(destination: str = Query(min_length=2, max_length=120)):
    """Provide forecast context plus official safety-reporting links."""
    try:
        center = geocode(destination)
        if not center:
            raise HTTPException(status_code=404, detail=f"Couldn't locate {destination}.")
        response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": center["lat"], "longitude": center["lon"],
                "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
                "forecast_days": 7, "timezone": "auto",
            },
            headers=HEADERS, timeout=10,
        )
        response.raise_for_status()
        forecast = response.json().get("daily", {})
        days = []
        dates = forecast.get("time", [])
        for i, date in enumerate(dates):
            def get_value(key):
                values = forecast.get(key, [])
                return values[i] if i < len(values) else None
            days.append({
                "date": date,
                "temperature_max_c": get_value("temperature_2m_max"),
                "temperature_min_c": get_value("temperature_2m_min"),
                "precipitation_probability_percent": get_value("precipitation_probability_max"),
                "precipitation_mm": get_value("precipitation_sum"),
                "weather_code": get_value("weather_code"),
            })
        return {
            "destination": destination, "forecast": days,
            "safety_links": [
                {"label": "India Meteorological Department (IMD) warnings", "url": "https://mausam.imd.gov.in/"},
                {"label": "National Disaster Management Authority (NDMA)", "url": "https://ndma.gov.in/"},
            ],
            "note": "Forecasts are not disaster alerts. Check current district-level official warnings and local authority guidance before mountain, river, waterfall or remote-area travel.",
            "source": "Open-Meteo",
        }
    except HTTPException:
        raise
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="Weather data is temporarily unavailable. Check the official warning links before travelling.") from exc
