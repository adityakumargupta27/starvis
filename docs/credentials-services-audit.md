# STARVIS AI V2 Credentials and Services Audit

Date: 2026-06-24
Scope: `starvis-1` primary SaaS refactor, with `starvis` checked for legacy configuration references.

This audit intentionally records credential status only. It does not include secret values, API keys, connection strings, tokens, or client IDs.

## Executive Summary

`starvis-1` already contains the main service integrations needed for the current SaaS upgrade:

- Firebase Web Auth configuration exists in local frontend environment configuration.
- Google sign-in is implemented through Firebase Auth and should be preserved.
- MongoDB Atlas is configured in the backend local environment and used by Mongoose.
- Gemini is configured server-side in `server/services/geminiService.js`.
- Resend is configured server-side in `server/services/emailService.js`.
- Vercel SPA routing exists through `vercel.json`.
- JWT-based backend auth exists and is used by protected API middleware.

Do not create duplicate Firebase projects, Google OAuth apps, MongoDB clusters, Gemini projects, or Resend senders. Reuse the existing local configuration unless a value fails validation during deployment.

The biggest credential-related risk is that the legacy `starvis/dist` build output contains an exposed Gemini API key in compiled JavaScript. Treat that key as compromised, rotate it in Google AI Studio or Google Cloud, and avoid deploying or committing build artifacts containing secrets.

## Existing Integrations Found

### Frontend App Configuration

Files:

- `starvis-1/.env.local`
- `starvis-1/.env.example`
- `starvis-1/src/lib/constants.ts`
- `starvis-1/src/lib/api.ts`

Found:

- `VITE_API_BASE_URL` is set locally.
- `VITE_APP_NAME` is set locally.
- `VITE_APP_VERSION` is set locally.
- `.env.example` documents the expected frontend variables.

Reuse:

- Keep the existing API base URL pattern.
- For production, set `VITE_API_BASE_URL` to the deployed Railway backend `/api/v1` URL.

### Firebase and Google OAuth

Files:

- `starvis-1/.env.local`
- `starvis-1/.env.example`
- `starvis-1/src/lib/firebase.ts`
- `starvis-1/src/contexts/AuthContext.tsx`
- `starvis/src/lib/firebase.ts`
- `starvis/src/contexts/AuthContext.tsx`

Found:

- `starvis-1/.env.local` contains a complete Firebase Web App config.
- `VITE_GOOGLE_CLIENT_ID` is still a placeholder in `starvis-1/.env.local`, but the current Google popup flow uses Firebase Auth and does not consume this variable.
- `starvis-1/src/lib/firebase.ts` initializes Firebase Auth from environment variables.
- `starvis-1/src/contexts/AuthContext.tsx` signs in with `signInWithPopup` when Firebase config exists.
- Legacy `starvis` used Firebase Auth directly for Google and email/password auth.
- Current `starvis-1` posts the Firebase-derived Google profile to the backend `/auth/google` route, which creates or links a MongoDB user and issues a JWT.

Reuse:

- Reuse the existing Firebase project and Web App config.
- Do not create a second Google OAuth client unless the existing Firebase project lacks the required production authorized domains.

Migration impact before auth changes:

- Current users in Firebase Auth and MongoDB must remain linkable by email.
- Any backend hardening should verify Firebase ID tokens rather than replacing Firebase sign-in.
- Existing localStorage migration from old local-only data to MongoDB should be preserved.
- The current `/auth/google` route trusts client-supplied profile fields. Before production, migrate to sending a Firebase ID token from the frontend and verifying it server-side with Firebase Admin, then upsert the MongoDB user from verified claims.

Credentials required only if deployment validation fails:

- Firebase Web App values for production environment variables.
- Firebase Admin service account or equivalent server-side verification method if implementing backend ID token verification.
- Authorized domains must include the Vercel production domain.

### MongoDB

Files:

- `starvis-1/server/.env`
- `starvis-1/server/.env.example`
- `starvis-1/server/db.js`
- `starvis-1/server/models/*.js`

Found:

- `MONGODB_URI` is set locally.
- Backend connects through Mongoose in `server/db.js`.
- Models exist for users, todos, assignments, calendar events, settings, study profile, notes, documents, flashcards, quizzes, pomodoro sessions, attendance, and study goals.
- Many newer SaaS/AI models include `userId` indexes and timestamps.

Reuse:

- Reuse the existing MongoDB Atlas URI and database.
- Do not create a new cluster or destructive migration.

Credentials required:

- Production `MONGODB_URI` for Railway if it is not already configured in Railway.

### Gemini AI

Files:

- `starvis-1/server/.env`
- `starvis-1/server/.env.example`
- `starvis-1/server/services/geminiService.js`
- `starvis-1/server/routes/v1/ai.js`
- `starvis-1/server/routes/v1/notes.js`
- `starvis-1/server/routes/v1/documents.js`
- `starvis-1/server/routes/v1/flashcards.js`
- `starvis-1/server/routes/v1/quizzes.js`
- `starvis-1/server/routes/v1/studyplan.js`
- Legacy risk: `starvis/dist/assets/*.js`

Found:

- `GEMINI_API_KEY` is set locally in the backend.
- Gemini calls in `starvis-1` are centralized server-side through `geminiService.js`.
- Legacy `starvis/src/components/FloatingAssistant.tsx` used `VITE_GEMINI_API_KEY` directly in the browser.
- Legacy `starvis/dist` contains a compiled hardcoded Gemini key.

Reuse:

- Reuse the existing backend `GEMINI_API_KEY` after rotation if the exposed key is the same credential.
- Keep Gemini server-side. Do not reintroduce browser-exposed Gemini keys.

Credentials required:

- A rotated Gemini API key if the exposed legacy build key is still active or was reused.

### Resend Email

Files:

- `starvis-1/server/.env`
- `starvis-1/server/.env.example`
- `starvis-1/server/services/emailService.js`
- `starvis-1/server/routes/auth.js`

Found:

- `RESEND_API_KEY` is set locally.
- `EMAIL_FROM` is set locally.
- Email service implements welcome, login alert, OTP, and assignment reminder email functions.
- Auth routes call welcome and login alert emails opportunistically.

Reuse:

- Reuse existing Resend API key and sender after verifying domain status in Resend.

Credentials required:

- Production `RESEND_API_KEY`.
- Verified production `EMAIL_FROM` sender/domain.

### Deployment

Files:

- `starvis-1/vercel.json`
- `starvis-1/.env.example`
- `starvis-1/server/.env.example`
- `starvis-1/.gitignore`

Found:

- Vercel rewrite config exists for the frontend SPA.
- No Railway config file was found.
- No Render config file was found.
- No Dockerfile or docker-compose file was found.
- `.gitignore` excludes frontend and backend env files.

Reuse:

- Reuse Vercel for frontend deployment.
- Use Railway environment variables for backend deployment rather than committing deployment secrets.

Credentials required:

- Vercel project environment variables.
- Railway service environment variables.
- Production backend URL for `VITE_API_BASE_URL`.
- Production frontend URL for `CLIENT_ORIGIN`.

### Cloudinary Storage

Files searched:

- Source, config, env examples, deployment files.

Found:

- No Cloudinary package, env variables, upload config, or storage adapter was found.
- Current PDF upload route stores extracted text and metadata in MongoDB and uses `multer` memory storage.

Reuse:

- No existing Cloudinary integration to reuse.

Credentials required:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- Optional folder/preset naming convention for STARVIS uploads.

### Monitoring and Analytics

Files searched:

- Source, package files, env examples, deployment files.

Found:

- No Sentry integration found.
- No PostHog integration found.

Credentials required:

- `SENTRY_DSN` for frontend and/or backend if Sentry is added.
- `POSTHOG_KEY` and `POSTHOG_HOST` if PostHog is added.

### Payments

Files:

- `starvis-1/server/config/plans.js`
- `starvis-1/server/routes/v1/billing.js`
- `starvis-1/server/.env.example`

Found:

- Mock billing mode is documented through `PAYMENT_MODE`.
- Razorpay env examples are commented and not active.
- No real payment processor credentials are required for the current directive because payments are mock-only for now.

Reuse:

- Keep mock billing until the SaaS architecture is validated.

## Missing Integrations

- Cloudinary storage.
- Sentry monitoring.
- PostHog analytics.
- Railway deployment config or documented Railway env setup.
- Firebase Admin server-side token verification.
- Production deployment documentation with exact env variable mapping.

## Credentials Required From The User

Ask only for these values when implementing the corresponding integration or deploying:

- Production `MONGODB_URI`, unless Railway already has the existing Atlas URI configured.
- Production `GEMINI_API_KEY`, preferably rotated because a legacy compiled build exposed a Gemini key.
- Production `RESEND_API_KEY` and verified `EMAIL_FROM`.
- Production Firebase Web App env values if they differ from local values.
- Firebase Admin credentials or project setup for backend ID token verification.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` before adding persistent file storage.
- `SENTRY_DSN` before adding monitoring.
- `POSTHOG_KEY` and `POSTHOG_HOST` before adding analytics.
- Vercel production frontend URL and Railway backend URL for cross-origin config.

Do not request or introduce real payment credentials yet.

## Services Successfully Reused

- Existing Firebase Auth flow for Google popup sign-in.
- Existing MongoDB Atlas connection via `MONGODB_URI`.
- Existing backend JWT auth and protected route middleware.
- Existing Gemini backend service through `GEMINI_API_KEY`.
- Existing Resend email service through `RESEND_API_KEY`.
- Existing Vercel SPA rewrite config.
- Existing localStorage-to-MongoDB migration helper in the auth context.

## Security Findings

1. Legacy compiled frontend bundle contains an exposed Gemini key.
   - Impact: API key should be considered compromised.
   - Action: Rotate the key and remove/deploy without build artifacts containing secrets.

2. Google backend login trusts client-supplied profile fields.
   - Impact: A malicious client could post arbitrary profile data to `/auth/google`.
   - Action: Send Firebase ID token from frontend and verify it on the backend before issuing STARVIS JWT.

3. JWT secrets exist locally but current access token expiry is hardcoded to `30d`.
   - Impact: Longer session exposure than intended by `.env.example`.
   - Action: Use `JWT_EXPIRES_IN` and implement refresh tokens deliberately.

4. Backend env example contains placeholder-looking email defaults.
   - Impact: Developers may deploy without a verified sender.
   - Action: Deployment docs should require verified Resend sender/domain.

5. Cloudinary, Sentry, and PostHog are requested by the SaaS directive but not configured.
   - Impact: Production file storage and observability are incomplete.
   - Action: Add only after receiving real credentials.

## Authentication Migration Plan

Before changing authentication:

1. Preserve Firebase Auth as the identity provider for Google sign-in.
2. Preserve MongoDB `User` documents and existing email-based linking.
3. Add Firebase Admin backend verification without changing the UI flow.
4. Change frontend Google login to send `result.user.getIdToken()` to `/auth/google`.
5. Update `/auth/google` to verify the token, then upsert by verified Firebase UID and email.
6. Keep backward compatibility during rollout by supporting the existing payload only in development or behind an explicit migration flag.
7. After production verification, remove mock Google profile fallback from production builds.

Expected impact:

- Existing users keep their account identity.
- MongoDB remains the application database.
- Firebase remains the OAuth provider.
- Backend JWT remains the API session token, but issuance becomes based on verified Firebase claims.

## Deployment Environment Checklist

Frontend on Vercel:

- `VITE_API_BASE_URL`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- Optional later: `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `VITE_SENTRY_DSN`

Backend on Railway:

- `PORT`
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `GEMINI_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CLIENT_ORIGIN`
- `PAYMENT_MODE=mock`
- `MAX_FILE_SIZE_MB`
- Later: Cloudinary, Sentry, Firebase Admin verification variables.

## Stop Conditions Before Production

Stop and ask the user for missing values if any production deployment lacks:

- Backend `MONGODB_URI`
- Backend `JWT_SECRET`
- Backend `GEMINI_API_KEY`
- Frontend Firebase Web App variables
- `CLIENT_ORIGIN`
- `VITE_API_BASE_URL`

Stop and rotate credentials before production if the exposed Gemini key in legacy build artifacts is still active.
