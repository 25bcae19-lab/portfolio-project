# Cyril — Full-stack portfolio

A single-page portfolio with a **Node.js + Express** backend, **MongoDB Atlas** for contact form storage, and a static **HTML / CSS / JavaScript** frontend. The server serves the `frontend/` folder and exposes `POST /contact` and `GET /health`.

## Project layout

```
portfolio-project/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   ├── server.js    # Express app, routes, static files
│   └── db.js        # MongoDB (Atlas) connection
├── package.json
└── README.md
```

**Note:** The original brief mentioned `database.db`; this project uses **MongoDB Atlas** only (no local SQLite file).

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer  
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and connection string  

## Run locally (VS Code)

1. Open the `portfolio-project` folder in VS Code (**File → Open Folder**).

2. Copy environment variables:

   ```bash
   copy .env.example .env
   ```

   On macOS/Linux: `cp .env.example .env`

3. Edit `.env` and set `MONGODB_URI` to your Atlas connection string (replace username, password, and cluster host). Example:

   ```
   MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

   In Atlas: **Network Access** → allow your IP (or `0.0.0.0/0` for testing). **Database Access** → user with read/write on the database you use in the URI.

4. Install dependencies and start the server:

   ```bash
   npm install
   npm start
   ```

5. Open a browser at **http://localhost:3000** (or the port in `.env` if you set `PORT`).

The UI is served by Express from `frontend/`. Submitting the contact form sends `POST /contact` with JSON `{ name, email, message }` and stores a document in the `contacts` collection (Mongoose model `Contact`).

### Optional: frontend only (no backend)

Opening `frontend/index.html` directly will show the site, but the contact form needs the API — use `npm start` for full behavior.

### Separate frontend deployment

If the frontend is hosted elsewhere (e.g. static hosting), set the form’s `fetch` URL to your API origin and configure `CORS_ORIGIN` on the server to that origin. For same-origin hosting (this repo’s default), no extra CORS setup is required.

## Deploy backend on Render

1. Push this project to GitHub.

2. In [Render](https://render.com): **New** → **Web Service**, connect the repo.

3. Settings:

   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** `Node`

4. **Environment variables** (Render dashboard):

   | Key            | Value |
   |----------------|--------|
   | `MONGODB_URI`  | Your MongoDB Atlas SRV connection string |
   | `PORT`         | *(optional; Render sets `PORT` automatically)* |
   | `CORS_ORIGIN`  | *(optional; set to your static site URL if the frontend is on another domain)* |

5. Deploy. Use **https://your-service.onrender.com/health** to verify the service is up.

If you serve the frontend from the same Render web service (static files from Express, as in this repo), one service is enough. If you split frontend and backend, point the static site’s form to `https://your-api.onrender.com/contact` and set CORS accordingly.

## API

| Method | Path       | Description |
|--------|------------|-------------|
| GET    | `/health`  | JSON health check (`ok`, `uptime`) |
| POST   | `/contact` | JSON body: `name`, `email`, `message` — saves to MongoDB |

Errors return JSON `{ "error": "..." }` with appropriate HTTP status codes.

## Scripts

- `npm start` — run the server  
- `npm run lint:server` — syntax check on `backend/server.js` and `backend/db.js`  

## GitHub Actions

The workflow in `.github/workflows/ci.yml` installs dependencies and runs `npm run lint:server` on push and pull requests to `main` / `master`.

## License

MIT
