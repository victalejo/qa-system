# GitHub Actions Workflows

## Deploy to Dokku

Este workflow despliega automáticamente la aplicación a Dokku en cada push a `main` o `master`.

### Secretos Requeridos:

Configure estos secretos en: **Settings** → **Secrets and variables** → **Actions**

| Secret Name | Description | Value |
|------------|-------------|-------|
| `DOKKU_SSH_PRIVATE_KEY` | Clave SSH privada (aurora) | Contenido de `~/.ssh/aurora` |
| `DOKKU_HOST` | IP del servidor Dokku | `62.146.226.24` |
| `DOKKU_APP_NAME` | Nombre de la app en Dokku | `qa-system` |
| `DOKKU_DOMAIN` | Dominio de la aplicación | `qa.s.iaportafolio.com` |

### Uso:

**Automático:**
```bash
git push origin master
```

**Manual:**
1. Ve a **Actions** → **Deploy to Dokku**
2. Click en **Run workflow**
3. Selecciona la rama y confirma

### Ver Documentación Completa:

Lee [GITHUB-ACTIONS-SETUP.md](../../GITHUB-ACTIONS-SETUP.md) para instrucciones detalladas.
