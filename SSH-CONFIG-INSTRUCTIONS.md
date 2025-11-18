# Configuración SSH para Deployment

## Ubicación de la clave SSH

La clave privada SSH debe estar en: `~/.ssh/aurora`

## Configurar SSH Config

Agrega la siguiente configuración a tu archivo `~/.ssh/config` (créalo si no existe):

```
Host dokku-qa
    HostName 62.146.226.24
    User root
    IdentityFile ~/.ssh/aurora
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

Host 62.146.226.24
    User root
    IdentityFile ~/.ssh/aurora
    StrictHostKeyChecking no
```

## Permisos de la clave

Asegúrate de que la clave tenga los permisos correctos:

### En Linux/Mac:
```bash
chmod 600 ~/.ssh/aurora
chmod 644 ~/.ssh/config
```

### En Windows:
Si estás usando Windows, puedes configurar los permisos desde Git Bash o WSL:

```bash
# Asegúrate de que la clave existe
ls ~/.ssh/aurora

# Configurar permisos
chmod 600 ~/.ssh/aurora
```

## Verificar conexión

Prueba la conexión SSH:

```bash
ssh -i ~/.ssh/aurora root@62.146.226.24
```

Si te conectas exitosamente, tu configuración SSH está lista.

## Para Git con Dokku

Una vez configurado, puedes usar:

```bash
git remote add dokku dokku@62.146.226.24:qa-system
git push dokku main
```

Git usará automáticamente la configuración SSH definida en `~/.ssh/config`.
