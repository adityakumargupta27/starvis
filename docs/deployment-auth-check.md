# STARVIS Deployment Auth Check

Date: 2026-06-24
Deployment checked: `https://starvis.vercel.app`

## What Was Verified

- The deployed site responds with HTTP 200.
- The deployed frontend contains the Google sign-in button.
- The deployed frontend contains API base wiring.
- The deployed frontend does not expose browser-side Gemini calls.
- The deployed main bundle did not show Firebase Auth code or Firebase config markers during static inspection.

## Current Conclusion

Google auth cannot be considered production-ready on `starvis.vercel.app` until the Vercel project has the Firebase Web App environment variables configured and the Firebase project authorizes the production domain.

The app now blocks mock Google login in production. If Firebase config is missing on Vercel, users will see a configuration error instead of being signed in with a fake Google profile.

## Required Vercel Environment Variables

Set these in the Vercel project for Production, Preview, and Development as needed:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_API_BASE_URL`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`

Do not add Gemini keys to frontend Vercel variables. Gemini must stay on the backend as `GEMINI_API_KEY`.

## Required Firebase Console Settings

In Firebase Console:

1. Open Authentication.
2. Enable Google provider.
3. Add `starvis.vercel.app` to Authorized domains.
4. Confirm the Firebase Web App config matches the Vercel env variables.

In Google Cloud Console, if using custom OAuth settings:

1. Confirm the OAuth client belongs to the same Firebase project.
2. Confirm authorized JavaScript origins include `https://starvis.vercel.app`.

## Backend Requirement

The frontend Google popup signs in with Firebase, then the app posts the user profile to the backend `/api/v1/auth/google` route to create the MongoDB user and issue a STARVIS JWT.

Before final production launch, harden this by sending a Firebase ID token and verifying it on the backend with Firebase Admin. Do not replace the existing Firebase project or Google OAuth app.
