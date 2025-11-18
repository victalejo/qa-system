#!/bin/bash
# Script para configurar la aplicación QA en Dokku
# Servidor: 62.146.226.24
# Dominio: qa.s.iaportafolio.com

set -e

echo "================================================"
echo "  Configuración Inicial de QA System en Dokku"
echo "================================================"
echo ""

# Variables
SERVER="root@62.146.226.24"
APP_NAME="qa-system"
DB_NAME="qa-db"
DOMAIN="qa.s.iaportafolio.com"
JWT_SECRET="b90030140ed64321ec15b6d452e34dfb7da1ebf10251ac961927b7ee60d4aa7039d95bd63f5f515f8b005655d3e46092f6f58c380fe19c68ef6bc9a097ee2f12"

echo "📋 Configurando con los siguientes parámetros:"
echo "   Servidor: $SERVER"
echo "   Aplicación: $APP_NAME"
echo "   Base de datos: $DB_NAME"
echo "   Dominio: $DOMAIN"
echo ""

# Ejecutar comandos en el servidor
ssh -i ~/.ssh/aurora "$SERVER" << ENDSSH

echo "🔍 Verificando que Dokku esté instalado..."
if ! command -v dokku &> /dev/null; then
    echo "❌ Error: Dokku no está instalado en el servidor"
    exit 1
fi

echo "✅ Dokku encontrado"
echo ""

echo "📦 Verificando/Instalando plugin de MongoDB..."
if ! dokku plugin:list | grep -q mongo; then
    echo "Instalando plugin dokku-mongo..."
    sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git mongo
else
    echo "✅ Plugin mongo ya está instalado"
fi
echo ""

echo "🚀 Creando aplicación '$APP_NAME'..."
if dokku apps:list | grep -q "$APP_NAME"; then
    echo "⚠️  La aplicación '$APP_NAME' ya existe"
else
    dokku apps:create "$APP_NAME"
    echo "✅ Aplicación creada"
fi
echo ""

echo "🗄️  Configurando MongoDB..."
if dokku mongo:list | grep -q "$DB_NAME"; then
    echo "⚠️  La base de datos '$DB_NAME' ya existe"
else
    dokku mongo:create "$DB_NAME"
    echo "✅ Base de datos creada"
fi

echo "🔗 Vinculando base de datos a la aplicación..."
dokku mongo:link "$DB_NAME" "$APP_NAME"
echo "✅ Base de datos vinculada"
echo ""

echo "⚙️  Configurando variables de entorno..."
dokku config:set "$APP_NAME" NODE_ENV=production
dokku config:set "$APP_NAME" JWT_SECRET="$JWT_SECRET"
echo "✅ Variables de entorno configuradas"
echo ""

echo "🌐 Configurando dominio..."
if dokku domains:report "$APP_NAME" | grep -q "$DOMAIN"; then
    echo "⚠️  El dominio '$DOMAIN' ya está configurado"
else
    dokku domains:add "$APP_NAME" "$DOMAIN"
    echo "✅ Dominio agregado"
fi
echo ""

echo "📦 Verificando/Instalando plugin Let's Encrypt..."
if ! dokku plugin:list | grep -q letsencrypt; then
    echo "Instalando plugin letsencrypt..."
    sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
else
    echo "✅ Plugin letsencrypt ya está instalado"
fi
echo ""

echo "🔒 Configurando SSL con Let's Encrypt..."
echo "⚠️  Nota: Esto requiere que el dominio '$DOMAIN' apunte a este servidor"
dokku letsencrypt:set "$APP_NAME" email admin@iaportafolio.com
echo "✅ Email configurado para Let's Encrypt"
echo ""

echo "📊 Resumen de la configuración:"
dokku config:show "$APP_NAME"
echo ""

echo "🔗 Información de MongoDB:"
dokku mongo:info "$DB_NAME"
echo ""

ENDSSH

echo "================================================"
echo "  ✅ Configuración completada exitosamente"
echo "================================================"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Asegúrate de que el dominio $DOMAIN apunta a 62.146.226.24"
echo "   2. Agrega el remote de Dokku:"
echo "      git remote add dokku dokku@62.146.226.24:$APP_NAME"
echo "   3. Haz el primer deploy:"
echo "      git push dokku main"
echo "   4. Activa SSL después del deploy:"
echo "      ssh -i ~/.ssh/aurora $SERVER 'dokku letsencrypt:enable $APP_NAME'"
echo ""
