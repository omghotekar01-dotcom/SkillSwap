# SkillSwap Campus

SkillSwap Campus is a student-focused web application for sharing learning resources, finding peer services, and communicating with other students. The repository includes a React frontend, a Node.js backend, and a separate set of C programming exercises used for coursework.

## Project at a glance

The frontend has routes for service listings, notes, user profiles, messages, dashboards, and administration. The backend provides REST routes for authentication, notes, services, messaging, reviews, and uploads, with Socket.IO used for real-time messaging.

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB through Mongoose, with a local file-based fallback for development |
| Authentication | JWT-based demo/application authentication |
| C coursework | Standalone terminal programs and Windows launchers |

## Run the web application

You need Node.js and npm. Start the backend and frontend in separate terminals.

**Backend**

```powershell
cd backend
npm install
npm run dev
```

The backend defaults to `http://localhost:5000`. It reads environment settings such as `PORT`, `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` from its environment. For local work, configure these values privately; never use development tokens or demonstration credentials on an internet-facing deployment.

**Frontend**

```powershell
cd frontend
npm install
npm run dev
```

Vite prints its local URL, usually `http://localhost:5173`. The API and allowed frontend origin must be configured consistently.

To check that the frontend compiles, run `npm run build` inside `frontend/`. The backend defines `dev` and `start` scripts; there is no root-level monorepo test command.

## Features and code navigation

- `frontend/src/pages/` contains the main experiences: marketplace, notes, messages, profiles, dashboards, and admin views.
- `frontend/src/App.jsx` maps the browser routes and applies protected-route wrappers.
- `backend/routes/` contains API route modules.
- `backend/controllers/` holds request handling and domain operations.
- `backend/models/` defines the stored records.
- `backend/server.js` configures Express, WebSocket messaging, and database/fallback startup.

Some routes and features depend on data and local configuration. A page appearing in the navigation is not by itself evidence that a full production workflow is ready.

## C programming exercises

The `c-programs/` directory contains small examples for file handling, service searching, sorting ratings, and student records. These are independent of the React/Express application.

On Windows, `run_terminal.bat` opens the C terminal workflow; `run_terminal.ps1` is the PowerShell alternative. `start.bat` provides a menu for terminal mode or website startup instructions.

## Development status and safety

This is an academic prototype. When MongoDB is unavailable, the backend can switch to a file-based authentication fallback with sample accounts. That mode is intended for local exploration only, **not production access control**. Do not deploy the fallback login or the development JWT settings publicly.

The repository also contains development files and historical demo material. Review configuration and remove or rotate any exposed credentials before deployment. The public Git history may retain previously committed configuration even after a file is removed from the latest branch.

## What to explore next

For a code review, start with the route definitions in `frontend/src/App.jsx`, then follow the corresponding request handlers in `backend/routes/` and `backend/controllers/`. The C exercises can be reviewed separately as basic programming demonstrations.
