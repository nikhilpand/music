@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo Starting Sukoon Backend on http://localhost:8000
python -m uvicorn server:app --reload --port 8000 --host 0.0.0.0
