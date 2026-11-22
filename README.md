# Saraha — Backend + React Frontend

## Requirements
- Node.js 20+
- MongoDB
- Redis (the current backend uses Redis for OTP and token revocation)

## Backend setup
1. In the project root, copy `config/.env.development.example` to `config/.env.development`.
2. Set `DB_URL_ONLINE` and `REDIS_URL` to your MongoDB and Redis connection strings.
3. Install dependencies with `npm install`.
4. Start the API with `npm run dev` (default: `http://localhost:3000`).

## Frontend setup
1. Open a second terminal and run `cd frontend`.
2. Run `npm install`.
3. Optionally copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`.
4. Run `npm run dev` and open `http://localhost:5173`.

## Included frontend flows
- Sign in and account creation
- Email OTP confirmation
- Authenticated user dashboard and inbox
- Copyable public profile link
- Anonymous message submission

## Notes
- Email confirmation requires working SMTP/email delivery in the backend. The existing mail service is configured in `src/common/service/sendEmail.js`; move credentials to environment variables before deploying.
- Do not deploy with the sample/local database settings or hard-coded JWT/encryption secrets. Configure secrets through environment variables and rotate any credentials that have previously been committed.
- The API currently expects the existing MongoDB + Redis services to be running.
