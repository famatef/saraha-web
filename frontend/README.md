# Saraha Frontend

React + Vite client for the Saraha Express API.

## Run

1. Start the backend using the root instructions in `../README.md`.
2. Copy `.env.example` to `.env` if your API is not at `http://localhost:3000`.
3. From this directory run `npm install`, then `npm run dev`.
4. Open the Vite URL (normally `http://localhost:5173`).

The app includes sign in, signup + email OTP confirmation, authenticated inbox, share-link copying, and an anonymous public message form.

Set `VITE_PUBLIC_APP_URL` to the deployed frontend URL before sharing links with friends. If it is unset, the app uses the current browser origin; local development links such as `localhost` only work on your own device.
