# STARVIS

Cross-Platform Academic Productivity and Study Architecture

---

## Overview

STARVIS is a unified academic productivity system engineered for modern university workflows. Designed with a cross-platform architecture deployed across Web and native Android (via Capacitor), STARVIS supports over 200 monthly active users (MAU) in managing coursework deadlines, automated study session scheduling, and contextual academic assistance.

The platform combines real-time cloud data synchronization through Firebase Firestore with an offline-capable client state engine, ensuring zero data loss during unstable campus connectivity.

---

## Key Capabilities

### Cross-Platform Native & Web Deployment
- Single Unified Codebase: Built using React 18, TypeScript, and Vite, compiled down to native Android APKs via Capacitor 8 with complete access to device-level notifications and biometric authentication.
- Responsive Design: Optimized viewports scaling across mobile smartphones, tablets, and desktop workstations with zero UI divergence.

### Real-Time Sync & Offline State
- Hybrid Data Layer: Firebase Cloud Firestore synchronization with optimistic local mutations, providing uninterrupted task and note editing even when disconnected from the network.
- Google Authentication: Seamless single sign-on across mobile and web via `@codetrix-studio/capacitor-google-auth`.

### Academic Analytics & Planning
- Productivity Telemetry: Visualizes study duration, task completion velocity, and subject balance metrics using Recharts.
- Intelligent Scheduling: Prioritizes impending deadlines based on course credit weight, submission urgency, and estimated complexity.
- Contextual Study Assistance: Integrated Gemini and OpenAI pipelines for topic summarization, syllabus breakdown, and quiz generation.

---

## System Architecture

```
                  +--------------------------------+
                  |         STARVIS Client         |
                  |     React 18 + TypeScript      |
                  |    Tailwind CSS + Radix UI     |
                  +---------------+----------------+
                                  |
               +------------------+------------------+
               |                                     |
    [ Capacitor 8 Bridge ]                  [ Web Deployment ]
    Native Android Runtime                  Vite Production Bundle
    Hardware APIs / Push Alerts             Global CDN Hosting
               |                                     |
               +------------------+------------------+
                                  |
                       HTTPS / WebSocket
                                  |
                   [ Firebase Cloud Services ]
                   - Authentication (Google SSO)
                   - Cloud Firestore (Real-Time DB)
                   - Cloud Storage (Attachments)
```

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend Framework | React 18, TypeScript, Vite |
| Mobile Runtime | Capacitor 8 (`@capacitor/android`, `@capacitor/core`, `@capacitor/cli`) |
| Backend & Database | Google Firebase (Auth, Firestore, Cloud Functions) |
| UI & Animation | Tailwind CSS, Radix UI Primitives, Framer Motion, Lucide Icons |
| State & Forms | React Hook Form, Zod v3, TanStack React Query v5 |
| Visualizations | Recharts |
| Testing & QA | Vitest, Playwright, React Testing Library |

---

## Directory Structure

```
starvis/
├── android/             # Android Studio native Gradle project
│   ├── app/             # Application source, manifests, and build configs
│   └── build.gradle     # Root Gradle build script
├── src/                 # React TypeScript source code
│   ├── components/      # UI primitives, task boards, analytics charts
│   ├── pages/           # Dashboard, Schedule, Analytics, AI Assistant
│   ├── lib/             # Firebase configuration, helper utilities
│   └── App.tsx          # Router configuration and state providers
├── capacitor.config.ts  # Capacitor platform configurations
├── vite.config.ts       # Vite bundler options
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v20.0.0 or higher)
- npm or bun
- Android Studio with Android SDK (API 34+) for mobile compilation
- Java Development Kit (JDK 17 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/adityakumargupta27/starvis.git
   cd starvis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Firebase project configuration credentials and AI API keys.

4. Start web development server:
   ```bash
   npm run dev
   ```

### Mobile Development (Android)

1. Build web assets and sync to native Android:
   ```bash
   npm run build:mobile
   ```

2. Open project in Android Studio:
   ```bash
   npm run cap:open
   ```

3. Build Debug APK via command line:
   ```bash
   npm run apk:debug
   ```
   The compiled APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Testing

Run unit and integration tests via Vitest:
```bash
npm run test
```

Execute end-to-end browser automation suites via Playwright:
```bash
npx playwright test
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
