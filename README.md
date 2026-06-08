# Excel Viewer (Auto Refresh)

This version uses a local backend to read an Excel file and return rows to the frontend.
When the file changes, the frontend auto-refreshes and shows updated values.

## Run

From project root:

```bash
npm install
```

Start backend:

```bash
cd server
npm install
npm start
```

In another terminal, start frontend:

```bash
cd ..
npm install
npm start
```

Open `http://localhost:3000`.
By default, frontend polls `/api/excel/range` every 15 seconds and updates the table.

## Notes

- Set `EXCEL_SOURCE=local_file` and `EXCEL_LOCAL_PATH=...` in `server/.env`.
- Default sheet/range are controlled in `src/utils/index.js`.
- You can manually force refresh with `Refresh now` button.
