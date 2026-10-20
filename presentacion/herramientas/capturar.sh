#!/bin/bash
# Capturas sin interfaz de uno o varios beats, sin transiciones.
# Uso: herramientas/capturar.sh carpeta_salida 3.4 5.1 ...
set -e
dir="$1"; shift
mkdir -p "$dir"
pres="$(cd "$(dirname "$0")/.." && pwd)/index.html"
for b in "$@"; do
  google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1920,1080 \
    --virtual-time-budget=3000 --screenshot="$dir/$b.png" "file://$pres?captura=1#$b" >/dev/null 2>&1
done
