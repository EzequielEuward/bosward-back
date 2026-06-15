# Guía de despliegue — Bosward

Backend (NestJS) → **Render** · Frontend (Vite + React) → **Netlify** · Base de datos → **PostgreSQL** (Render).

---

## 0. Modos dev / prod (resumen)

| | Desarrollo | Producción |
|---|---|---|
| **Backend** | `npm run start:dev` (NODE_ENV=development) | `npm run start:prod` en Render (NODE_ENV=production) |
| **Base de datos** | Postgres local con `docker compose up -d` | Postgres gestionado de Render |
| **Variables** | archivo `.env` (local) | dashboard de Render |
| **Frontend** | `npm run dev` → `.env.development` | build en Netlify → `.env.production` |

El backend carga automáticamente `.env.<NODE_ENV>` y, como fallback, `.env`. En la nube, las variables del dashboard ganan sobre cualquier archivo.

---

## 1. Backend en local (modo desarrollo)

```bash
docker compose up -d          # levanta Postgres 16 + Adminer (localhost:8080)
cp .env.example .env          # completá Firebase y Cloudinary
npm install
npm run start:dev             # http://localhost:3000  ·  Swagger: /api
```

`.env` para local:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=secret
DB_DATABASE=ward_perfumes
DB_SSL=false
DB_SYNC=true
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

---

## 2. Base de datos en Render

1. En Render: **New + → PostgreSQL** (plan Free). Nombre: `bosward-db`.
2. Cuando esté lista, copiá de la pestaña *Info*:
   - **Internal Database URL** → la usa el web service (más rápida, misma red).
   - **External Database URL** → la usás vos para correr la migración desde tu PC.

> Alternativa: subir todo con el `render.yaml` incluido (**New + → Blueprint**), que crea la base y el servicio juntos.

---

## 3. Backend en Render (modo producción)

1. **New + → Web Service**, conectá este repo.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
2. **Environment** → cargá estas variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<Internal Database URL del paso 2>
   DB_SSL=true
   DB_SYNC=true                       # primer deploy: crea las tablas
   ALLOWED_ORIGINS=https://bosward-frontend.netlify.app
   FIREBASE_PROJECT_ID=bosward-14ad4
   FIREBASE_SERVICE_ACCOUNT_PATH=/etc/secrets/firebase-service-account.json
   CLOUDINARY_CLOUD_NAME=<tu cloud name>
   CLOUDINARY_API_KEY=<tu api key>
   CLOUDINARY_API_SECRET=<tu api secret>
   ```
   > Los valores reales de Cloudinary están en tu `.env` local; copialos de ahí al dashboard de Render. Nunca los pongas en archivos versionados.
   - **No** seteés `PORT`: Render lo inyecta y el backend ya lo respeta.
3. **Firebase (Secret File)**: en el web service → pestaña **Environment → Secret Files → Add Secret File**:
   - Filename: `firebase-service-account.json`
   - Contents: pegá el contenido completo de tu archivo local `firebase-service-account.json`.
   - Render lo monta en `/etc/secrets/firebase-service-account.json` (que es lo que apunta `FIREBASE_SERVICE_ACCOUNT_PATH`).
4. Deploy. En los logs deberías ver `🚀 Server running...` y la creación de tablas.
5. Verificá: `https://bosward-back.onrender.com/api` (Swagger).

> Nota plan Free: el servicio se "duerme" tras inactividad; el primer request luego de un rato tarda unos segundos. Para una demo es suficiente.

---

## 4. Migrar tus datos locales (MySQL → Postgres)

Con el esquema ya creado en Render (paso 3) y tu **MySQL local** corriendo con los datos:

Los datos de origen (tu MySQL local) ya están en el `.env`. Solo falta pegar el
destino: poné la **External Database URL** de Render en `TARGET_DATABASE_URL` del
`.env` y corré:

```bash
npm run migrate:db
```

El script copia tabla por tabla en orden de FKs preservando los UUID, y es idempotente (podés re-correrlo). Verificá los conteos que imprime, o revisá las tablas en Adminer/`psql`.

> El origen sale de `SOURCE_DB_*` del `.env` (tu MySQL local, base `bosward`).

Una vez migrado y verificado, podés poner `DB_SYNC=false` en Render para que no vuelva a tocar el esquema.

---

## 5. Frontend en Netlify (Vite + React)

> Se aplica en el repo del frontend.

1. Variables de entorno:
   - `.env.development`: `VITE_API_URL=http://localhost:3000`
   - `.env.production`: `VITE_API_URL=https://bosward-back.onrender.com`
2. En el código, consumí la API con `import.meta.env.VITE_API_URL` (reemplazá URLs hardcodeadas).
3. Routing SPA: creá `public/_redirects` con:
   ```
   /*    /index.html   200
   ```
4. En Netlify → **Add new site → Import**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Environment: `VITE_API_URL = https://bosward-back.onrender.com`
5. La URL de Netlify (`https://bosward-frontend.netlify.app`) ya está en `ALLOWED_ORIGINS` del backend.

---

## 6. Checklist final (end-to-end)

- [ ] Backend `/api` (Swagger) responde en Render.
- [ ] El sitio de Netlify lista perfumes (datos migrados visibles).
- [ ] Login con Firebase funciona.
- [ ] Subida de imagen (Cloudinary) funciona.
- [ ] Sin errores de CORS en la consola del navegador.
