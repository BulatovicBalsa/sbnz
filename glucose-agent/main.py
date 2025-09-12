#!/usr/bin/env python3
"""
Simplified CGM Agent:
- On startup: fetch t0Real and generate 1 hour of samples.
- After that: generate a new sample every real-time interval (simulated time moves faster).
- Keeps all data in memory (no file).
- /history returns past samples from memory.
"""

import time
import math
import signal
import random
import threading
import requests
import atexit
from flask import Flask, request, jsonify

# ========= Config =========
SERVER_URL = "http://localhost:8000"
START_ENDPOINT = "/api/clock/start"
PUSH_ENDPOINT = "/api/glucose"

LIVE_INTERVAL_SECONDS = 30
SPEED = 10.0
STEP_SECONDS = 300  # 5 minutes (simulated)
BASE_MMOL = 6.5
SEED = 42

# Wave parameters
WAVE_MIN_MMOL = 7.0
WAVE_MAX_MMOL = 14.0
WAVE_PERIOD_MINUTES = 60  # period of one full wave in simulated minutes
WAVE_JITTER_SD = 0.2      # small random noise to avoid perfect regularity

# ========= Globals =========
t0_real_server = None  # Fetched at startup
samples = []  # In-memory list of {"t": ..., "mmol": ...}
stop_event = threading.Event()
rng = random.Random(SEED)

# ========= Utilities =========
def now_ms_local() -> int:
    return int(time.time() * 1000)

def now_ms_simulated() -> int:
    if t0_real_server is None:
        return now_ms_local()
    return int(t0_real_server + (now_ms_local() - t0_real_server) * SPEED)

def fetch_t0_real():
    global t0_real_server
    while not stop_event.is_set():
        try:
            resp = requests.get(f"{SERVER_URL}{START_ENDPOINT}", timeout=5)
            resp.raise_for_status()
            t0_real_server = int(resp.json()["t0Real"])
            print(f"[init] Synced t0Real = {t0_real_server}")
            return
        except Exception as e:
            print(f"[init] Failed to fetch t0Real: {e}")
            time.sleep(2)

def wave_mmol(sim_ms: int) -> float:
    """Smooth sine wave mapped to [WAVE_MIN_MMOL, WAVE_MAX_MMOL]."""
    period_ms = max(1, WAVE_PERIOD_MINUTES * 60 * 1000)  # avoid div-by-zero
    phase = (sim_ms % period_ms) / period_ms  # 0..1
    mid = (WAVE_MIN_MMOL + WAVE_MAX_MMOL) / 2.0
    amp = (WAVE_MAX_MMOL - WAVE_MIN_MMOL) / 2.0
    base = mid + amp * math.sin(2 * math.pi * phase)
    mmol = base + rng.gauss(0, WAVE_JITTER_SD)
    return round(min(WAVE_MAX_MMOL, max(WAVE_MIN_MMOL, mmol)), 1)

def circadian_drift(sim_ms: int, amp: float = 0.6) -> float:
    day_ms = 24 * 60 * 60 * 1000
    phase = (sim_ms % day_ms) / day_ms
    return amp * math.sin(2 * math.pi * phase)

def generate_sample(sim_ms: int) -> dict:
    mmol = wave_mmol(sim_ms)
    return {"t": sim_ms, "mmol": mmol}

def generate_initial_history(hours: int = 1):
    print(f"[init] Generating {hours}h of simulated samples...")
    now_sim = now_ms_simulated()
    start_sim = now_sim - hours * 60 * 60 * 1000
    for i in range((hours * 60) // (STEP_SECONDS // 60)):
        t_ms = start_sim + i * STEP_SECONDS * 1000
        sample = generate_sample(t_ms)
        samples.append(sample)
    print(f"[init] Generated {len(samples)} initial samples.")

def push_to_server(sample: dict):
    try:
        r = requests.post(f"{SERVER_URL}{PUSH_ENDPOINT}", json=sample, timeout=5)
        r.raise_for_status()
        print(f"[push] {sample}")
    except Exception as e:
        print(f"[push] Failed: {e}")

# ========= Background thread =========
def live_loop():
    while not stop_event.is_set():
        t_sim = now_ms_simulated()
        sample = generate_sample(t_sim)
        samples.append(sample)
        push_to_server(sample)
        time.sleep(LIVE_INTERVAL_SECONDS)

# ========= Flask App =========
app = Flask(__name__)

@app.get("/history")
def history():
    """Return samples within the last N minutes of simulated time."""
    try:
        minutes = int(request.args.get("minutes", "180"))
        cutoff = now_ms_simulated() - minutes * 60 * 1000
        result = [s for s in samples if s["t"] >= cutoff]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ========= Lifecycle =========
def stop(*_):
    stop_event.set()
    print("[agent] stopping...")

def main():
    atexit.register(stop)
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)

    fetch_t0_real()
    generate_initial_history(hours=1)

    thread = threading.Thread(target=live_loop, daemon=True)
    thread.start()

    app.run(host="0.0.0.0", port=9001, debug=False, use_reloader=False)
    thread.join()

if __name__ == "__main__":
    main()
