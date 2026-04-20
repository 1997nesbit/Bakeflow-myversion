* Bakeflow — Deployment Guide

> Deployment target: **Railway** (two services + PostgreSQL plugin).
> Frontend: Next.js 16 (App Router). Backend: Django 4.x + DRF + Gunicorn.

---

## Architecture

```
Browser → Railway HTTPS proxy → Next.js service (bakeflow.up.railway.app)
                              → Django service  (radiant-charisma-test.up.railway.app)
                              → PostgreSQL plugin (private network)
```

Railway terminates TLS at the proxy. Both services receive plain HTTP internally.

---

## Services

### Frontend — Next.js

* SettingValueRoot directory`/` (repo root)Builder`RAILPACK`Build command*(auto-detected by Railpack — runs `pnpm build`)*Start command`pnpm start`Restart policy`ON_FAILURE` (max 3 retries)

**Environment variables:**

| Variable                             | Value                                           |
| ------------------------------------ | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`              | `https://<backend-domain>.up.railway.app/api` |
| `NEXT_PUBLIC_APP_NAME`             | `Bakeflow`                                    |
| `NEXT_PUBLIC_CURRENCY`             | `TZS`                                         |
| `NEXT_PUBLIC_TOKEN_EXPIRY_MINUTES` | `60`                                          |

> `NEXT_PUBLIC_*` variables are baked into the client bundle at build time.
> Changing them in the dashboard requires a full redeploy to take effect.

---

### Backend — Django

| Setting        | Value                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| Root directory | `/backend`                                                                    |
| Builder        | `RAILPACK`                                                                    |
| Build command  | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| Start command  | `bash start.sh` (delegates to `backend/start.sh`)                           |
| Restart policy | `ON_FAILURE` (max 3 retries)                                                  |

**Environment variables:**

| Variable                   | Value                                                                          |
| -------------------------- | ------------------------------------------------------------------------------ |
| `DJANGO_SETTINGS_MODULE` | `config.settings.production`                                                 |
| `DJANGO_ENV`             | `production`                                                                 |
| `SECRET_KEY`             | Generate with `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
| `ALLOWED_HOSTS`          | `<backend-domain>.up.railway.app`                                            |
| `CORS_ALLOWED_ORIGINS`   | `https://<frontend-domain>.up.railway.app`                                   |
| `DATABASE_URL`           | Set by Railway PostgreSQL plugin — link the plugin to this service            |
| `BRIQ_API_KEY`           | SMS gateway API key from Briq.tz dashboard                                   |
| `BRIQ_SENDER_ID`         | Registered sender name, e.g. `BakeflowTZ`                                   |

---

### Database — PostgreSQL plugin

Add via Railway dashboard: **+ New → Database → PostgreSQL**.
Link it to the backend service — Railway injects `DATABASE_URL` automatically.
`django-environ`'s `env.db('DATABASE_URL')` parses it directly (see `base.py`).

---

## Config files

### `railway.toml` (frontend — repo root)

```toml
[build]
builder = "RAILPACK"

[deploy]
startCommand = "pnpm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### `backend/railway.toml` (backend)

```toml
[build]
builder = "RAILPACK"
buildCommand = "pip install -r requirements.txt && python manage.py collectstatic --noinput"

[deploy]
startCommand = "python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

---

## Key production settings (`backend/config/settings/production.py`)

```python
# Railway terminates TLS at the proxy and forwards as HTTP internally.
# This header tells Django the original request was HTTPS — prevents redirect loop.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True   # only safe after HTTPS is confirmed working end-to-end

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True

X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
```

**Why `SECURE_PROXY_SSL_HEADER` is required:** Railway's reverse proxy handles HTTPS
and forwards requests to Django over plain HTTP. Without this setting, Django sees
`HTTP` and issues a 301 redirect to `HTTPS` — causing `ERR_TOO_MANY_REDIRECTS`
because the proxy always strips it back to HTTP. This setting tells Django to trust
the `X-Forwarded-Proto: https` header set by Railway's proxy.

---

## Static files

Served by **WhiteNoise** — no separate static file server needed.

- `WhiteNoiseMiddleware` sits directly after `SecurityMiddleware` in `MIDDLEWARE`
- `STATIC_ROOT = BASE_DIR / 'staticfiles'`
- `STORAGES['staticfiles']` uses `CompressedManifestStaticFilesStorage` (brotli + fingerprinting)
- `collectstatic` runs as part of the build command in `railway.toml`

---

## Database connection

`base.py` checks for `DATABASE_URL` first (Railway production) and falls back to
individual `DB_*` env vars (local development):

```python
if env('DATABASE_URL', default=None):
    DATABASES = {'default': env.db('DATABASE_URL')}
else:
    DATABASES = {'default': { 'ENGINE': '...postgresql', 'NAME': env('DB_NAME'), ... }}
```

---

## Private networking (egress reduction)

Railway private networking keeps traffic between services inside Railway's
infrastructure. Useful only for **server-to-server** calls (Next.js API routes or
Server Components → Django). Does not help browser → Django calls since the browser
is outside Railway's network.

To enable:

1. Enable **Private Networking** on both services in Railway dashboard settings.
2. Internal hostname format: `<service-name>.railway.internal`
3. Use `http://` (not `https://`) for internal calls — the internal network is unencrypted.
4. Add the internal hostname to Django's `ALLOWED_HOSTS`.

The current Bakeflow architecture makes all API calls from the browser directly,
so private networking provides no egress benefit at present.

---

## SMS Gateway (Briq.tz)

Sending real SMS requires wiring `NotificationService._send_via_gateway()` in `backend/apps/notifications/services.py`.

1. Set backend environment variables:
   ```
   BRIQ_API_KEY=<your key from Briq.tz dashboard>
   BRIQ_SENDER_ID=BakeflowTZ
   ```
2. Implement the `requests.post` call inside `_send_via_gateway()`:
   ```python
   import requests
   requests.post(
       'https://karibu.briq.tz/v1/messaging/send/',
       headers={'Authorization': f'Bearer {settings.BRIQ_API_KEY}'},
       json={'from': settings.BRIQ_SENDER_ID, 'to': recipient, 'message': message},
       timeout=15,
   )
   ```
3. Seed notification templates after deployment:
   ```
   python manage.py seed_notification_templates
   ```

Until `BRIQ_API_KEY` is configured, all campaign sends will succeed in the DB (`NotificationLog` rows created with `status='sent'`) but **no actual SMS is dispatched**.

---

## Deployment checklist

- [ ] `NEXT_PUBLIC_API_URL` includes `https://` protocol and `/api` path suffix
- [ ] `CORS_ALLOWED_ORIGINS` matches the exact frontend domain (no trailing slash)
- [ ] `ALLOWED_HOSTS` includes the backend Railway domain
- [ ] `DATABASE_URL` linked from the PostgreSQL plugin
- [ ] `SECRET_KEY` set to a randomly generated value — never committed to git
- [ ] `DJANGO_SETTINGS_MODULE=config.settings.production` set on backend service
- [ ] Frontend redeployed after any `NEXT_PUBLIC_*` variable change (baked at build time)
- [ ] `SECURE_PROXY_SSL_HEADER` present in production settings (prevents redirect loop)
- [ ] `SECURE_HSTS_PRELOAD = True` only after confirming HTTPS works end-to-end
- [ ] `BRIQ_API_KEY` set to your Briq.tz API key (required for live SMS sending)
- [ ] `BRIQ_SENDER_ID` set to your registered sender name (e.g. `BakeflowTZ`)
- [ ] `python manage.py seed_notification_templates` run after first deploy to seed default SMS templates

