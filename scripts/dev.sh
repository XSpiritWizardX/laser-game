#!/usr/bin/env bash
set -euo pipefail

python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python -m app || python main.py || python app.py
