#!/bin/bash
# Configurar log rotation en el servidor Oracle
# Ejecutar una sola vez: ./scripts/setup-pm2-logrotate.sh
#
# Esto limita los logs a ~70MB en disco y los rota cada 7 días.
# Sin esto, los logs crecen infinito y llenan el disco de 47GB.

set -e

SERVER="ubuntu@147.15.80.215"
KEY="~/.ssh/oci_clickpy"

echo ">> Configurando PM2 log rotation..."

ssh -i $KEY $SERVER '
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  pm2 install pm2-logrotate

  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  pm2 set pm2-logrotate:compress true
  pm2 set pm2-logrotate:dateFormat YYYY-MM-DD
  pm2 set pm2-logrotate:workerInterval 30
  pm2 set pm2-logrotate:rotateInterval "0 0 * * *"

  echo ""
  echo ">> Configuración actual:"
  pm2 conf pm2-logrotate
'

echo ""
echo ">> Log rotation configurado."
echo "   - Archivos de max 10MB"
echo "   - Se mantienen 7 archivos (≈7 días)"
echo "   - Se comprimen automáticamente"
