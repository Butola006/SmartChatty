# SmartChatty

SmartChatty is a realtime full-stack chat application built with the MERN stack, Socket.io, TailwindCSS, Zustand, and JWT authentication.

## Overview

This repository contains a production-ready chat app with:
- Realtime messaging using Socket.io
- User authentication and authorization via JWT
- A MongoDB backend with Mongoose models
- Cloudinary image uploads and profile picture support
- A responsive React + Tailwind frontend
- Global state management using Zustand

## Repo structure

- `backend/`
  - `src/` backend implementation
  - `src/controllers/` auth and message controllers
  - `src/models/` MongoDB models for users and messages
  - `src/routes/` API routing for auth and messaging
  - `src/lib/` database, socket, and Cloudinary helper utilities
  - `src/middleware/` authentication middleware
  - `src/seeds/` seed data for users
- `frontend/`
  - `src/` React app source code
  - `src/components/` UI components and chat layout
  - `src/pages/` app views such as login, signup, profile, and settings
  - `src/store/` Zustand stores for auth, chat, and theme state
  - `public/` static assets
  - `vite.config.js`, `tailwind.config.js`, and `postcss.config.js`
- `package.json` root build/start orchestration

## Local setup

### Prerequisites

- Node.js installed
- MongoDB connection string
- A Cloudinary account for image uploads

### Environment variables

Create a `.env` file in the `backend/` folder with:

```env
MONGODB_URI=your_mongodb_uri
PORT=5001
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

### Install dependencies

From the repo root:

```bash
npm install --prefix backend
npm install --prefix frontend
```

### Run locally

Start the backend:

```bash
npm run dev --prefix backend
```

Start the frontend:

```bash
npm run dev --prefix frontend
```

### Build for production

```bash
npm run build
npm start
```

## Notes

- The project is owned and maintained by Aditya Singh Butola.
- Package metadata has been refreshed for current ownership and packaging.
- The root and backend `package.json` files now include ownership details.
- The deployed version is available at the link below.

## About

SmartChatty is a modern realtime chat app designed to showcase a full-stack messaging experience with authentication, realtime updates, and responsive UI.

Deployed project: https://smartchatty.onrender.com/

## Author

Aditya Singh Butola
