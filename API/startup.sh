service redis-server start
uvicorn main:app --reload --host 0.0.0.0 --port 8000