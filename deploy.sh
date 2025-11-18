#!/bin/bash
# Script de deployment para QA System

set -e

APP_NAME="qa-system"
SERVER="62.146.226.24"
REMOTE_NAME="dokku"

echo "================================================"
echo "  Deployment QA System a Dokku"
echo "================================================"
echo ""

# Verificar que estamos en un repositorio git
if [ ! -d .git ]; then
    echo "❌ Error: No estás en un repositorio git"
    echo "   Ejecuta: git init"
    exit 1
fi

# Verificar que hay commits
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "❌ Error: No hay commits en el repositorio"
    echo "   Ejecuta: git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Verificar/agregar remote de Dokku
if git remote | grep -q "^${REMOTE_NAME}$"; then
    echo "✅ Remote '$REMOTE_NAME' ya existe"
else
    echo "➕ Agregando remote '$REMOTE_NAME'..."
    git remote add "$REMOTE_NAME" "dokku@${SERVER}:${APP_NAME}"
    echo "✅ Remote agregado"
fi

echo ""
echo "🚀 Iniciando deployment..."
echo "   Remote: $REMOTE_NAME"
echo "   Servidor: $SERVER"
echo "   App: $APP_NAME"
echo ""

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Rama actual: $CURRENT_BRANCH"

# Hacer push
echo ""
echo "📤 Pushing to Dokku..."
git push "$REMOTE_NAME" "${CURRENT_BRANCH}:main"

echo ""
echo "================================================"
echo "  ✅ Deployment completado"
echo "================================================"
echo ""
echo "📝 Para ver los logs:"
echo "   ssh -i ~/.ssh/aurora root@$SERVER 'dokku logs $APP_NAME --tail'"
echo ""
echo "📝 Para verificar el estado:"
echo "   ssh -i ~/.ssh/aurora root@$SERVER 'dokku ps:report $APP_NAME'"
echo ""
echo "🌐 Tu aplicación debería estar en: https://qa.s.iaportafolio.com"
echo ""
