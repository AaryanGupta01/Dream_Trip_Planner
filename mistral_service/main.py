from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import httpx

load_dotenv()


class GenRequest(BaseModel):
    model: str | None = None
    prompt: str | None = None
    itinerary: list | None = None
    messages: list | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    api_key = os.environ.get('MISTRAL_API_KEY')
    if not api_key:
        print('Warning: MISTRAL_API_KEY not set; service will forward unauthenticated if upstream allows it')
    yield


app = FastAPI(title='Mistral Proxy', lifespan=lifespan)


@app.post('/generate')
async def generate(req: GenRequest):
    # Primary behavior: forward to a base REST URL (hosted Mistral or other HTTP proxy)
    rest_url = os.environ.get('MISTRAL_REST_URL') or os.environ.get('LOCAL_MISTRAL_URL')
    if not rest_url:
        raise HTTPException(status_code=500, detail='No MISTRAL_REST_URL or LOCAL_MISTRAL_URL configured')

    model = req.model or os.environ.get('MISTRAL_MODEL') or 'mistral-large-latest'

    # Build messages payload: prefer provided messages, else use prompt or itinerary
    messages = req.messages
    if not messages:
        if req.prompt:
            messages = [{ 'role': 'user', 'content': req.prompt }]
        elif req.itinerary:
            prompt = f"Optimize this travel itinerary for a short trip: {', '.join(req.itinerary)}"
            messages = [{ 'role': 'user', 'content': prompt }]
        else:
            raise HTTPException(status_code=400, detail='Provide `messages`, `prompt`, or `itinerary`')

    payload = { 'model': model, 'messages': messages }

    headers = { 'Content-Type': 'application/json' }
    api_key = os.environ.get('MISTRAL_API_KEY')
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'

    # Try a few retries with exponential backoff in case upstream is slow
    max_retries = 3
    backoff = 1.0
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(rest_url, json=payload, headers=headers)
                resp.raise_for_status()
                return resp.json()
        except httpx.HTTPStatusError as e:
            # Upstream returned a non-2xx response — no point retrying on 4xx
            status = e.response.status_code
            text = e.response.text
            if 400 <= status < 500:
                raise HTTPException(status_code=502, detail=f'Upstream returned {status}: {text}')
            last_error = f'Upstream HTTP error {status}: {text}'
        except Exception as e:
            last_error = str(e)

        # If not last attempt, wait and retry
        if attempt < max_retries:
            await httpx.sleep(backoff)
            backoff *= 2

    # All retries failed
    raise HTTPException(status_code=504, detail=f'Upstream proxy timeout/failure: {last_error}')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='127.0.0.1', port=int(os.environ.get('PORT', 8001)), reload=False)
