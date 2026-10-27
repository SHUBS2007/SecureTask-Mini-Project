# SecureTask — Full-Stack Task Management Mini-Project

A React + Vite frontend, Express backend, and MongoDB Atlas database.

## Requirements
- Node.js LTS and npm
- MongoDB Atlas account (or a local MongoDB instance)
- Git is optional for local development

## 1. Configure MongoDB
Create a MongoDB Atlas database and database user. Copy your connection string, then create `backend/.env` from `backend/.env.example` and set `MONGODB_URI`.

Example:
`mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/securetask`

Do not commit `.env` or share database credentials.

## 2. Run the backend
Open a terminal in this folder:

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, fill in `MONGODB_URI`, then run:

```bash
npm run dev
```

The API will be available at http://localhost:5000 and the task endpoint at http://localhost:5000/api/tasks.

## 3. Run the frontend
Open a second terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://localhost:5173.

The frontend defaults to `http://localhost:5000`. To change it, create `frontend/.env.local` with:
`VITE_API_URL=http://localhost:5000`

## 4. Build frontend for production
From `frontend`:

```bash
npm run build
```

The production build is created in `frontend/dist`.

## 5. Deployment overview
- Backend: deploy the `backend` folder as a Node web service. Build command `npm install`; start command `npm start`.
- Set `MONGODB_URI` as a secret environment variable in your host.
- Frontend: deploy the `frontend` folder as a Vite app. Build command `npm run build`; output directory `dist`.
- Set `VITE_API_URL` to the deployed backend's HTTPS URL in the frontend host.
- Restrict backend CORS to your deployed frontend origin before public production use.

## Features
- Create, list, complete/reopen, filter, and delete tasks
- MongoDB persistence
- API health endpoint
- Basic request validation and error handling

Note: The project is provided as source code. You must configure your own database and deploy it to obtain real public URLs and screenshots.
