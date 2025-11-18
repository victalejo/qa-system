# Configuración de GitHub Actions para Auto-Deployment

## 📋 Resumen

Este proyecto está configurado para hacer deployments automáticos a Dokku cada vez que hagas push a las ramas `main` o `master`.

## 🔑 Paso 1: Configurar Secretos en GitHub

Debes agregar los siguientes secretos en tu repositorio de GitHub:

### Ir a Configuración de Secretos:

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

### Secretos Requeridos:

#### 1. `DOKKU_SSH_PRIVATE_KEY`

**Descripción:** La clave SSH privada para conectarse al servidor Dokku (clave aurora)

**Cómo obtenerla:**

En tu máquina local, ejecuta:

```bash
cat ~/.ssh/aurora
```

**Copia todo el contenido** (incluyendo `-----BEGIN OPENSSH PRIVATE KEY-----` y `-----END OPENSSH PRIVATE KEY-----`)

**Valor para GitHub Secret:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW...
... (todo el contenido de la clave privada)
-----END OPENSSH PRIVATE KEY-----
```

---

#### 2. `DOKKU_HOST`

**Descripción:** La IP o hostname del servidor Dokku

**Valor:**
```
62.146.226.24
```

---

#### 3. `DOKKU_APP_NAME`

**Descripción:** El nombre de la aplicación en Dokku

**Valor:**
```
qa-system
```

---

#### 4. `DOKKU_DOMAIN`

**Descripción:** El dominio de la aplicación (para verificar el deployment)

**Valor:**
```
qa.s.iaportafolio.com
```

---

## ✅ Paso 2: Verificar Configuración

Una vez agregados los secretos, deberías tener 4 secretos configurados:

- ✅ `DOKKU_SSH_PRIVATE_KEY`
- ✅ `DOKKU_HOST`
- ✅ `DOKKU_APP_NAME`
- ✅ `DOKKU_DOMAIN`

## 🚀 Paso 3: Hacer Push al Repositorio

### Primera vez - Crear repositorio en GitHub:

```bash
# Si aún no has conectado el repositorio remoto
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# Push inicial
git push -u origin master
```

### Deployments subsecuentes:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push origin master
```

## 🔄 Cómo Funciona el Workflow

1. **Trigger:** Se activa automáticamente al hacer push a `main` o `master`
2. **Checkout:** Descarga el código del repositorio
3. **Setup SSH:** Configura la clave SSH para conectarse a Dokku
4. **Deploy:** Hace push del código a Dokku
5. **Verify:** Verifica que el deployment fue exitoso con un health check
6. **Status:** Muestra el resultado del deployment

## 📊 Monitorear Deployments

### Ver el progreso del deployment:

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás la lista de workflows ejecutados
4. Click en cualquier workflow para ver los detalles y logs

### Estados posibles:

- 🟢 **Success:** Deployment exitoso
- 🔴 **Failure:** Deployment falló (revisa los logs)
- 🟡 **In Progress:** Deployment en progreso
- ⚪ **Queued:** Esperando para ejecutarse

## 🛠️ Deployment Manual

Si necesitas hacer un deployment manual sin hacer push:

1. Ve a la pestaña **Actions** en GitHub
2. Selecciona el workflow **Deploy to Dokku**
3. Click en **Run workflow**
4. Selecciona la rama
5. Click en **Run workflow**

## ⚙️ Configuración del Workflow

El workflow está configurado en: `.github/workflows/deploy.yml`

### Características:

- ✅ Auto-deployment en push a main/master
- ✅ Deployment manual desde GitHub UI
- ✅ Health check automático post-deployment
- ✅ Logs detallados de cada paso
- ✅ Notificación de éxito/fallo

### Personalizar el workflow:

Puedes editar `.github/workflows/deploy.yml` para:

- Cambiar las ramas que activan el deployment
- Agregar tests antes del deployment
- Agregar notificaciones (Slack, Discord, etc.)
- Cambiar el timeout del health check
- Agregar pasos adicionales

## 🔍 Troubleshooting

### Error: "Permission denied (publickey)"

**Causa:** La clave SSH no está configurada correctamente

**Solución:**
1. Verifica que el secreto `DOKKU_SSH_PRIVATE_KEY` contenga la clave completa
2. Asegúrate de que la clave tenga los encabezados correctos

### Error: "Health check failed"

**Causa:** La aplicación no responde en el endpoint `/health`

**Solución:**
1. Verifica que la aplicación se haya desplegado correctamente
2. Revisa los logs en el servidor: `ssh -i ~/.ssh/aurora root@62.146.226.24 'dokku logs qa-system --tail'`

### Error: "fatal: Could not read from remote repository"

**Causa:** Problemas de conexión al servidor Dokku

**Solución:**
1. Verifica que `DOKKU_HOST` sea correcto
2. Verifica que el servidor esté accesible
3. Verifica que la clave SSH tenga permisos en el servidor

## 📝 Ejemplo de Secretos en GitHub

Así deberían verse tus secretos en GitHub:

```
Name                      Value
─────────────────────────────────────────────
DOKKU_APP_NAME           qa-system
DOKKU_DOMAIN             qa.s.iaportafolio.com
DOKKU_HOST               62.146.226.24
DOKKU_SSH_PRIVATE_KEY    ••••••••••••••••••
```

## 🎯 Flujo de Trabajo Completo

```
1. Developer hace cambios en el código
   ↓
2. git commit -m "Cambios"
   ↓
3. git push origin master
   ↓
4. GitHub Actions detecta el push
   ↓
5. Ejecuta el workflow de deployment
   ↓
6. Conecta al servidor Dokku vía SSH
   ↓
7. Hace push del código a Dokku
   ↓
8. Dokku construye la imagen Docker
   ↓
9. Dokku despliega la nueva versión
   ↓
10. GitHub Actions verifica el health check
   ↓
11. Notifica el resultado (Success/Failure)
   ↓
12. Deployment completo 🎉
```

## ⏱️ Tiempo Estimado

- **Setup inicial:** ~5 minutos
- **Deployment automático:** ~3-5 minutos por push
- **Verificación:** ~10 segundos

## 🔒 Seguridad

### Buenas Prácticas:

- ✅ Nunca commitees las claves SSH al repositorio
- ✅ Usa GitHub Secrets para información sensible
- ✅ Limita el acceso a los secretos solo a workflows necesarios
- ✅ Rota las claves SSH periódicamente
- ✅ Revisa los logs de deployments regularmente

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dokku Documentation](http://dokku.viewdocs.io/dokku/)
- [SSH Key Management](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## 🆘 Soporte

Si tienes problemas con el auto-deployment:

1. Revisa los logs del workflow en GitHub Actions
2. Verifica que todos los secretos estén configurados correctamente
3. Consulta la sección de Troubleshooting
4. Revisa los logs del servidor Dokku

---

**¡Listo!** Una vez configurados los secretos, cada push a `main` o `master` desplegará automáticamente tu aplicación. 🚀
