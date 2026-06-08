# AquaPrime

Live Excel data in the browser. Reads workbook from OneDrive (local file +/or share link).

## Development

```bash
npm install
npm --prefix server install
```

Terminal 1 — API:
```bash
npm --prefix server run dev
```

Terminal 2 — frontend:
```bash
npm start
```

Open `http://localhost:3000`.

## Production (one server)

```bash
npm install
npm --prefix server install
npm run deploy:local
```

Open `http://localhost:4000` — site and API together.

See **[DEPLOY.md](./DEPLOY.md)** for cloud deploy, Docker, and public URL setup.

## Config (`server/.env`)

| Variable | Description |
|----------|-------------|
| `EXCEL_SOURCE` | `hybrid` (recommended), `local_file`, or `public_link` |
| `EXCEL_LOCAL_PATH` | Path to .xlsx on PC (dev / PC server) |
| `EXCEL_SHARE_URL` | Public OneDrive link for Excel Online |
| `EXCEL_DEFAULT_SHEET` | `աշխատող` |
| `EXCEL_DEFAULT_RANGE` | Empty = full sheet |
