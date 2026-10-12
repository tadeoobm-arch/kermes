#!/usr/bin/env bash
# Empaqueta el tema en un ZIP listo para "Tienda online › Temas › Agregar tema › Subir archivo zip".
set -euo pipefail
cd "$(dirname "$0")/../theme"
out="../dist/novaparfum-theme.zip"
mkdir -p ../dist
rm -f "$out"
zip -qr "$out" layout templates sections snippets assets config locales
echo "✔ $(cd ..; pwd)/dist/novaparfum-theme.zip"
