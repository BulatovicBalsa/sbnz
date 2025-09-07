#!/usr/bin/env python3
"""
CGM Agent
- Fetches t0Real from server (/api/clock/start) and uses SPEED to compute simulated time:
    simulated_time = t0Real + (now_local - t0_local) * SPEED
- Generates glucose values at LIVE_INTERVAL_SECONDS and POSTs to server as:
    { "t": <epoch_ms>, "mmol": <float> }   # matches GlucoseMessage(t, mmol)
- Appends every sample to JSONL (JSONL_PATH)
- Exposes:
    GET /health
    GET /history?minutes=180&step=300&base=6.5&seed=42
"""

import os
import time
import json
import math
import atexit
import signal
import random
import threading
from typing import Dict, Iterable, List
from dataclasses import dataclass

import requests
from flask import Flask, request, jsonify

# =========================
# Config (env overrides)
# =========================
SERVER_URL          = os.getenv("SERVER_URL", "http://localhost:8000")
PUSH_ENDPOINT       = os.getenv("PUSH_ENDPOINT", "/api/glucose")      # POST ingest endpoint
START_ENDPOINT      = os.getenv("START_ENDPOINT", "/api/clock/start") # GET -> {"t0Real": ...}

AGENT_PORT          = int(os.getenv("AGENT_PORT", "9001"))            # Flask port
# Live push interval (REAL TIME): send one sample every 30s
LIVE_INTERVAL_SECONDS = int(os.getenv("LIVE_INTERVAL_SECONDS", "30"))
# History step default (SIMULATED time): 5 minutes
HISTORY_DEFAULT_STEP  = int(os.getenv("HISTORY_DEFAULT_STEP", "300"))

BASE_MMOL           = float(os.getenv("BASE_MMOL", "6.5"))
JSONL_PATH          = os.getenv("JSONL_PATH", "data/glucose.jsonl")
SEED                = int(os.getenv("SEED", "42"))
# SPEED so that 30s real == 5 min simulated -> SPEED = 300 / 30 = 10
SPEED               = float(os.getenv("SPEED", "10.0"))

# =========================
# State
# =========================
stop_event = threading.Event()
t0_real_server: int | None = None   # server's t0Real (epoch ms)

# =========================
# Utilities
# =========================
def now_ms_local() -> int:
    return int(time.time() * 1000)

def ensure_dir(path: str):
    d = os.path.dirname(path)
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)

def append_jsonl(path: str, row: Dict):
    ensure_dir(path)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

# =========================
# Time model
# =========================
def sync_start_time() -> bool:
    """Fetch t0Real from the server."""
    global t0_real_server
    try:
        r = requests.get(f"{SERVER_URL}{START_ENDPOINT}", timeout=5)
        r.raise_for_status()
        payload = r.json()
        t0_real = int(payload.get("t0Real"))
        t0_real_server = t0_real
        print(f"[start-sync] t0Real={t0_real_server}, SPEED={SPEED}")
        return True
    except Exception as e:
        print(f"[start-sync] failed: {e}")
        return False

def time_sync_daemon():
    while not stop_event.is_set():
        if sync_start_time():
            break
        time.sleep(2)

def now_ms_simulated() -> int:
    """Compute simulated time = t0Real + (now_local - t0_local) * SPEED."""
    if t0_real_server is None:
        return now_ms_local()
    return int(t0_real_server + (now_ms_local() - t0_real_server) * SPEED)

# =========================
# Generators
# =========================
@dataclass
class HistoryParams:
    minutes: int
    step: int
    base: float
    seed: int
    noise_sigma: float = 0.2
    drift_amp: float = 0.6

def circadian_drift(sim_ms: int, amp: float) -> float:
    """Sinusoid based on SIMULATED time-of-day (~24h period)."""
    day_ms = 24 * 60 * 60 * 1000
    phase = (sim_ms % day_ms) / day_ms  # [0,1)
    return amp * math.sin(2 * math.pi * phase)

def gen_history_sinus(end_ts_ms: int, params: HistoryParams) -> List[Dict]:
    """Generate smooth sinusoidal glucose series ending at end_ts_ms (simulated)."""
    rng = random.Random(params.seed)
    total_steps = max(1, int((params.minutes * 60) // params.step))
    start_ts_ms = end_ts_ms - params.minutes * 60 * 1000

    values: List[Dict] = []
    for i in range(total_steps):
        t_ms = start_ts_ms + i * params.step * 1000
        drift = circadian_drift(t_ms, params.drift_amp)
        mmol = max(3.0, min(15.0, params.base + drift + rng.gauss(0, params.noise_sigma)))
        values.append({"t": int(t_ms), "mmol": round(mmol, 1)})
    return values

def gen_live_values(base: float, seed: int) -> Iterable[Dict]:
    """Infinite generator producing values around `base` every LIVE_INTERVAL_SECONDS (real)."""
    rng = random.Random(seed + 1337)
    while True:
        t_ms = now_ms_simulated()
        drift = circadian_drift(t_ms, amp=0.5)
        mmol = max(3.0, min(15.0, base + drift + rng.gauss(0, 0.25)))
        yield {"t": t_ms, "mmol": round(mmol, 1)}
        time.sleep(LIVE_INTERVAL_SECONDS)

# =========================
# Push loop
# =========================
def push_to_server(sample: Dict) -> bool:
    """POST {t, mmol} to the server (matches GlucoseMessage)."""
    try:
        r = requests.post(f"{SERVER_URL}{PUSH_ENDPOINT}", json={"t": sample["t"], "mmol": sample["mmol"]}, timeout=5)
        r.raise_for_status()
        return True
    except Exception as e:
        print(f"[push] failed: {e}")
        return False

def live_push_daemon():
    # wait for start sync
    while (t0_real_server is None) and not stop_event.is_set():
        time.sleep(0.2)
    print(f"[live] starting push loop (every {LIVE_INTERVAL_SECONDS}s real ≈ {int(LIVE_INTERVAL_SECONDS*SPEED)}s simulated)")
    for sample in gen_live_values(BASE_MMOL, SEED):
        if stop_event.is_set():
            break
        append_jsonl(JSONL_PATH, sample)
        ok = push_to_server(sample)
        if ok:
            print(f"[live] pushed {sample}")
        else:
            print(f"[live] queued locally (push failed)")

# =========================
# Flask API (server -> agent)
# =========================
app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({
        "ok": True,
        "speed": SPEED,
        "t0Real": t0_real_server,
        "now_sim_ms": now_ms_simulated(),
        "jsonl_path": JSONL_PATH,
        "live_interval_seconds": LIVE_INTERVAL_SECONDS
    })

@app.get("/history")
def history():
    """
    GET /history?minutes=180&step=300&base=6.5&seed=42
    Returns simulated history ending at current simulated time.
    step is in SECONDS of SIMULATED time.
    """
    try:
        minutes = int(request.args.get("minutes", "180"))
        step    = int(request.args.get("step", str(HISTORY_DEFAULT_STEP)))  # default 300s (5 min) SIMULATED
        base    = float(request.args.get("base", str(BASE_MMOL)))
        seed    = int(request.args.get("seed", str(SEED)))
        params = HistoryParams(minutes=minutes, step=step, base=base, seed=seed)
        data = gen_history_sinus(now_ms_simulated(), params)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# =========================
# Lifecycle
# =========================
def start_threads() -> list[threading.Thread]:
    t1 = threading.Thread(target=time_sync_daemon, name="time-sync", daemon=True)
    t2 = threading.Thread(target=live_push_daemon, name="live-push", daemon=True)
    t1.start()
    t2.start()
    return [t1, t2]

def stop(*_):
    if not stop_event.is_set():
        stop_event.set()
        print("[agent] stopping...")

def main():
    atexit.register(stop)
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)

    threads = start_threads()
    app.run(host="0.0.0.0", port=AGENT_PORT, debug=False, use_reloader=False)
    for t in threads:
        t.join(timeout=1.0)

if __name__ == "__main__":
    main()
