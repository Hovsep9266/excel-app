# Deploy AquaPrime to production

## 24/7 without your PC (облако)

Чтобы сайт работал **когда компьютер выключен**, нужен **облачный сервер** (Render, Railway, VPS).  
На сервере **нет** вашего файла OneDrive — только **публичная ссылка** на Excel.

### Шаг 1 — Публичная ссылка OneDrive (обязательно)

1. [onedrive.live.com](https://onedrive.live.com) → `eco clim himnakan.xlsx`
2. **Поделиться** → **Все, у кого есть ссылка, могут просматривать**
3. Скопируйте ссылку
4. Проверка локально: `http://localhost:4000/api/excel/share-test` → `"ok": true`  
   Если ошибка — ссылка не публичная, сайт в облаке не заработает.

### Шаг 2 — GitHub

```bash
git add .
git commit -m "Prepare cloud deploy"
git push origin main
```

(Не коммитьте `server/.env` — там секреты.)

### Шаг 3 — Render.com (рекомендуется)

1. [render.com](https://render.com) → Sign up → **New Web Service**
2. Подключите GitHub-репозиторий `excel-app`
3. Настройки:
   - **Build:** `npm install && npm --prefix server install && npm run build`
   - **Start:** `npm run start:prod`
   - **Plan:** Starter ($7/мес) — **всегда включён** (бесплатный план засыпает)
4. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `EXCEL_SOURCE` | `share_link` |
   | `EXCEL_SHARE_URL` | ваша публичная ссылка OneDrive |
   | `EXCEL_DEFAULT_SHEET` | `աշխատող` |
   | `EXCEL_LOCAL_PATH` | *(пусто)* |
   | `FRONTEND_URL` | `https://ваш-сервис.onrender.com` |

5. **Deploy** → откройте URL Render — сайт работает 24/7.

Или: **New → Blueprint** и выберите `render.yaml` из репозитория.

### Как это работает

```
Excel Online (браузер) → OneDrive облако → ваш сайт на Render (каждые 15 сек)
```

Ваш ПК **может быть выключен**.

---

## Before deploy

1. **OneDrive share link** (required for Excel Online on cloud server):
   - Open `eco clim himnakan.xlsx` on [onedrive.live.com](https://onedrive.live.com)
   - Share → **Anyone with the link can view**
   - Copy link → put in `EXCEL_SHARE_URL`

2. Test link locally:
   ```
   http://localhost:4000/api/excel/share-test
   ```
   Must return `"ok": true`.

---

## Option A — Your PC as server (simplest)

Good if the PC is always on and has OneDrive synced.

1. Build and run:
   ```bash
   npm install
   npm --prefix server install
   npm run deploy:local
   ```

2. Open `http://localhost:4000` (site + API on one port).

3. Expose to internet (pick one):
   - **Cloudflare Tunnel** (free): [developers.cloudflare.com/cloudflare-one/connections/connect-apps](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
   - **ngrok**: `ngrok http 4000`
   - Router port forwarding → your PC IP:4000

4. In `server/.env`:
   ```
   FRONTEND_URL=https://your-public-url.com
   EXCEL_SOURCE=hybrid
   EXCEL_LOCAL_PATH=C:\Users\USER\OneDrive\eco clim himnakan.xlsx
   EXCEL_SHARE_URL=your-public-onedrive-link
   ```

5. Keep running with **PM2** (optional):
   ```bash
   npm install -g pm2
   pm2 start npm --name aquaprime -- run start:prod
   pm2 save
   ```

---

## Option B — Cloud (Render / Railway / VPS / Docker)

On cloud there is **no local Excel file**. Use **share link only**.

1. Copy `server/.env.production.example` → set env vars on hosting panel:
   ```
   EXCEL_SOURCE=hybrid
   EXCEL_LOCAL_PATH=          (empty)
   EXCEL_SHARE_URL=https://... (public OneDrive link)
   EXCEL_DEFAULT_SHEET=աշխատող
   NODE_ENV=production
   PORT=4000
   FRONTEND_URL=https://your-app.onrender.com
   ```

2. **Docker**:
   ```bash
   docker build -t aquaprime .
   docker run -p 4000:4000 --env-file server/.env aquaprime
   ```

3. **Render.com** (example):
   - New Web Service → connect GitHub repo
   - Build command: `npm install && npm --prefix server install && npm run build`
   - Start command: `npm run start:prod`
   - Add environment variables from `server/.env.production.example`

---

## Production checklist

| Item | Value |
|------|--------|
| `EXCEL_SHARE_URL` | Public OneDrive link |
| `EXCEL_DEFAULT_SHEET` | `աշխատող` |
| `NODE_ENV` | `production` |
| `REACT_APP_API_BASE_URL` | empty (same server) |
| Secrets (`.env`) | **Never commit to git** |

---

## Verify after deploy

1. `https://your-domain.com` — login page loads
2. `https://your-domain.com/api/excel/health` — `"ok": true`
3. `https://your-domain.com/api/excel/share-test` — share link works
4. Login with user from Excel → table shows data
5. Change cell in Excel Online → wait 15s → site updates
