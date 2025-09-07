@echo off
REM =======================
REM Configure environment
REM =======================
set SERVER_URL=http://localhost:8000
set PUSH_ENDPOINT=/api/glucose
set TIME_ENDPOINT=/api/time
set AGENT_PORT=9001
set STEP_SECONDS=300
set BASE_MMOL=6.5
set JSONL_PATH=data\glucose.jsonl
set SEED=42

REM =======================
REM Optional: activate venv
REM (comment out if not using venv)
REM =======================
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)

REM =======================
REM Run the agent
REM =======================
python main.py

REM Keep window open if error
pause
