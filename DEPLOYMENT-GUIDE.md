# Guía de Deployment - QA System en Dokku

## 📋 Información del Deployment

- **Servidor**: 62.146.226.24
- **Dominio**: qa.s.iaportafolio.com
- **Aplicación**: qa-system (monolítica - backend + frontend)
- **Base de datos**: MongoDB (plugin dokku-mongo)
- **SSL**: Let's Encrypt (automático)
- **Clave SSH**: ~/.ssh/aurora

## 🚀 Proceso de Deployment Completo

### Paso 1: Configurar SSH

1. Asegúrate de tener la clave `aurora` en `~/.ssh/aurora`

2. Configura `~/.ssh/config` (ver [SSH-CONFIG-INSTRUCTIONS.md](./SSH-CONFIG-INSTRUCTIONS.md)):

```bash
# En Linux/Mac
cat >> ~/.ssh/config << 'EOF'
Host 62.146.226.24
    User root
    IdentityFile ~/.ssh/aurora
    StrictHostKeyChecking no
EOF

chmod 600 ~/.ssh/aurora
chmod 644 ~/.ssh/config
```

3. Verifica la conexión:

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24
```

### Paso 2: Configurar el Servidor Dokku

Ejecuta el script de configuración inicial:

```bash
bash setup-dokku.sh
```

Este script realiza:
- ✅ Instala el plugin de MongoDB
- ✅ Crea la aplicación `qa-system`
- ✅ Crea la base de datos `qa-db`
- ✅ Vincula la BD a la aplicación
- ✅ Configura variables de entorno (NODE_ENV, JWT_SECRET)
- ✅ Configura el dominio `qa.s.iaportafolio.com`
- ✅ Instala el plugin de Let's Encrypt

**⚠️ Importante**: Asegúrate de que el dominio `qa.s.iaportafolio.com` apunte a la IP `62.146.226.24` antes de continuar.

### Paso 3: Inicializar Git (si no está inicializado)

```bash
# Si no tienes git inicializado
git init

# Agregar archivos
git add .

# Primer commit
git commit -m "Setup inicial para deployment en Dokku"
```

### Paso 4: Agregar Remote de Dokku

```bash
git remote add dokku dokku@62.146.226.24:qa-system
```

Verifica los remotes:

```bash
git remote -v
```

### Paso 5: Hacer el Primer Deploy

Opción A - Usar el script de deployment:

```bash
bash deploy.sh
```

Opción B - Deployment manual:

```bash
git push dokku main
```

> **Nota**: Si tu rama principal se llama `master`, usa `git push dokku master:main`

### Paso 6: Activar SSL con Let's Encrypt

Una vez que el deployment sea exitoso:

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku letsencrypt:enable qa-system'

# Configurar renovación automática
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku letsencrypt:auto-renew qa-system'
```

### Paso 7: Verificar el Deployment

1. **Verificar que la aplicación está corriendo**:

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku ps:report qa-system'
```

2. **Ver los logs**:

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku logs qa-system --tail'
```

3. **Probar el health check**:

```bash
curl https://qa.s.iaportafolio.com/health
```

Deberías ver una respuesta como:

```json
{
  "status": "ok",
  "timestamp": "2024-01-XX...",
  "uptime": 123.45,
  "environment": "production"
}
```

4. **Acceder a la aplicación**:

Abre en tu navegador: https://qa.s.iaportafolio.com

## 🔄 Deployments Posteriores

Para deployments futuros (después de hacer cambios):

```bash
# 1. Hacer commit de tus cambios
git add .
git commit -m "Descripción de los cambios"

# 2. Push a Dokku
git push dokku main

# O usar el script
bash deploy.sh
```

## 🛠️ Comandos Útiles

### Ver información de la aplicación

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku config:show qa-system'
```

### Ver información de MongoDB

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku mongo:info qa-db'
```

### Acceder a la consola de MongoDB

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku mongo:connect qa-db'
```

### Reiniciar la aplicación

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku ps:restart qa-system'
```

### Ver logs en tiempo real

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku logs qa-system -t'
```

### Cambiar una variable de entorno

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku config:set qa-system VARIABLE=valor'
```

### Hacer backup de MongoDB

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku mongo:export qa-db > backup-$(date +%Y%m%d).dump'
```

### Escalar la aplicación (más instancias)

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku ps:scale qa-system web=2'
```

## 🔍 Troubleshooting

### El deployment falla

1. Verifica los logs:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku logs qa-system --tail 100'
   ```

2. Verifica el build log:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku logs qa-system --num -1'
   ```

### La aplicación no responde

1. Verifica el estado:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku ps:report qa-system'
   ```

2. Reinicia:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku ps:restart qa-system'
   ```

### Error de MongoDB

1. Verifica que la BD esté corriendo:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku mongo:list'
   ```

2. Verifica el link:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku mongo:links qa-db'
   ```

### SSL no funciona

1. Verifica que el dominio apunte al servidor:
   ```bash
   nslookup qa.s.iaportafolio.com
   ```

2. Verifica el estado de Let's Encrypt:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku letsencrypt:list'
   ```

3. Reintenta la activación:
   ```bash
   ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku letsencrypt:enable qa-system'
   ```

## 📊 Arquitectura del Deployment

```
┌─────────────────────────────────────────────┐
│  Navegador (https://qa.s.iaportafolio.com) │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │   Nginx Proxy   │
         │  (Dokku/Let's   │
         │   Encrypt SSL)  │
         └────────┬────────┘
                  │
                  ▼
       ┌──────────────────┐
       │  Docker Container │
       │   (qa-system)     │
       │                   │
       │  ┌─────────────┐  │
       │  │  Node.js    │  │
       │  │  Express    │  │
       │  │             │  │
       │  │ - API (/api)│  │
       │  │ - Frontend  │  │
       │  │   (static)  │  │
       │  └─────────────┘  │
       └────────┬──────────┘
                │
                ▼
       ┌──────────────────┐
       │  MongoDB         │
       │  Container       │
       │  (qa-db)         │
       └──────────────────┘
```

## 📝 Variables de Entorno Configuradas

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Modo de producción |
| `JWT_SECRET` | `b90030...f12` | Secreto para JWT (128 chars) |
| `MONGO_URL` | Auto-configurado | URL de MongoDB (por dokku-mongo) |
| `PORT` | Auto-configurado | Puerto dinámico (por Dokku) |

## 🎯 Checklist de Deployment

- [ ] Configuración SSH completada
- [ ] Clave `aurora` en su lugar y con permisos correctos
- [ ] Dominio `qa.s.iaportafolio.com` apuntando a `62.146.226.24`
- [ ] Script `setup-dokku.sh` ejecutado exitosamente
- [ ] Git inicializado con commit inicial
- [ ] Remote de Dokku agregado
- [ ] Primer deployment ejecutado (`git push dokku main`)
- [ ] SSL activado con Let's Encrypt
- [ ] Health check funcionando (`/health`)
- [ ] Aplicación accesible en https://qa.s.iaportafolio.com
- [ ] Frontend cargando correctamente
- [ ] API respondiendo en `/api/*`

## 📚 Recursos Adicionales

- [DOKKU-UNIVERSAL-GUIDE.md](./DOKKU-UNIVERSAL-GUIDE.md) - Guía completa de Dokku
- [SSH-CONFIG-INSTRUCTIONS.md](./SSH-CONFIG-INSTRUCTIONS.md) - Configuración SSH detallada
- [Documentación oficial de Dokku](http://dokku.viewdocs.io/dokku/)
- [Plugin dokku-mongo](https://github.com/dokku/dokku-mongo)

## 🆘 Soporte

Si encuentras problemas durante el deployment:

1. Revisa los logs detalladamente
2. Verifica cada paso del checklist
3. Consulta la sección de Troubleshooting
4. Revisa la guía universal de Dokku

---

**¡Listo!** Tu aplicación QA System está desplegada en producción con SSL, MongoDB y listo para usar.
