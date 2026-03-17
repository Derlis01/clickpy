#!/bin/bash
# Deploy del backend a Oracle Cloud
# Uso: ./scripts/deploy-api.sh

set -e

SERVER="ubuntu@147.15.80.215"
KEY="~/.ssh/oci_clickpy"

echo ">> Deploying clickpy-api..."

ssh -i $KEY $SERVER '
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  cd ~/app
  git pull origin main
  CI=true pnpm install
  pnpm --filter @clickpy/api build
  pm2 restart clickpy-api

  sleep 2
  pm2 status
'

echo ""
echo ">> Deploy complete. Testing..."
curl -sI https://api.clickpy.app | head -3
